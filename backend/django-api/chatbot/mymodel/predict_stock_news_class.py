import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import joblib
import numpy as np
import random
from transformers import BertModel, BertTokenizer
from .train_bert_5class import BERTClassifier  # 실제 장고용
# from train_bert_5class import BERTClassifier  # 테스트용

# ✅ 랜덤 시드 고정 (결정적 결과)
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)
torch.use_deterministic_algorithms(True)

# ✅ 현재 파일 기준으로 saved_model 폴더 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # chatbot/mymodel/

MODEL_DIR = os.path.join(BASE_DIR, "saved_model")
MODEL_PATH = os.path.join(MODEL_DIR, "krfinbert_stock_classifier_5class.pth")
TOKENIZER_PATH = os.path.join(MODEL_DIR, "bert_tokenizer.pkl")

# 전역 변수 초기화
model = None
tokenizer = None
device = None

def load_model():
    global model, tokenizer, device

    if device is None:
        if torch.backends.mps.is_available():
            device = torch.device("mps")
            print("✅ MPS (Mac GPU) 사용 중")
        elif torch.cuda.is_available():
            device = torch.device("cuda")
            print("✅ CUDA 사용 중")
        else:
            device = torch.device("cpu")
            print("⚠️ GPU 사용 불가 - CPU 사용 중")

    if model is None:
        model_ = BERTClassifier(num_classes=5)
        model_.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model_.to(device)
        model_.eval()
        model_.float()
        print("✅ 모델 로딩 완료")
        model = model_

    if tokenizer is None:
        tokenizer_ = BertTokenizer.from_pretrained("snunlp/KR-FinBERT")

        # ✅ pad_token 설정
        if tokenizer_.pad_token is None:
            tokenizer_.pad_token = tokenizer_.eos_token or "[PAD]"

        print("✅ 토크나이저 from_pretrained 로딩 및 pad_token 설정 완료")
        tokenizer = tokenizer_


# ✅ 예측 함수
def predict(texts, max_len=128):
    load_model()

    if isinstance(texts, str):
        texts = [texts]

    tokens = tokenizer(
        texts,
        padding="max_length",
        truncation=True,
        max_length=max_len,
        return_tensors="pt"
    )
    input_ids = tokens["input_ids"].to(device).long()
    attention_mask = tokens["attention_mask"].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask)
        raw_probs = F.softmax(outputs, dim=1).cpu().tolist()
        raw_preds = torch.argmax(torch.tensor(raw_probs), dim=1).tolist()

    # ✅ 키워드 기반 확률 보정
    adjusted_probs = []
    for text, prob in zip(texts, raw_probs):
        adjusted = adjust_probs_with_keywords(prob, text)
        adjusted_probs.append(adjusted)

    adjusted_preds = [probs.index(max(probs)) for probs in adjusted_probs]

    return adjusted_preds, adjusted_probs

def adjust_probs_with_keywords(probs, text ,alpha=0.2):
        # 일반 상승 표현
    rise_keywords = [
        "상승", "급등", "강세", "상승세", "상승폭 확대", "반등", "회복", "강한 흐름", "견조한 흐름",
        "급격한 상승", "오름세", "우상향", "고공행진", "신고가", "최고가", "장중 강세", "상한가",
        "치솟다", "치솟은", "뛴다", "뛰었다", "올라", "올랐다", "올라서", "급등세", "상승 출발",
        "상승 마감", "상승률", "상승 모멘텀", "오름폭", "상승 기대감", "랠리", "수직 상승", "탄력받다",
        "폭등", "폭등세", "쑥쑥", "급반등", "재상승", "연일 상승", "연속 상승", "호조세", "상승 재개",

        "호재", "실적 호전", "수주", "신약 승인", "계약 체결", "투자 유치", "공급 계약", "기술력 부각",
        "수혜", "수혜 기대감", "성장 기대", "실적 기대", "매출 증가", "이익 증가", "실적 발표 호조",
        "긍정적 전망", "관심 집중", "거래량 급증", "외국인 매수", "기관 매수", "테마 상승", "정책 수혜",
        "모멘텀 부각","%↑","↑", "우수"

    ]

    fall_keywords = [
        "하락", "급락", "약세", "하락세", "하락폭 확대", "급격한 하락", "하락 출발", "하락 마감", "약보합",
        "하한가", "장중 약세", "저조한 흐름", "하락 전환", "하락 반전", "낙폭", "낙폭 확대", "밀렸다", "밀림",
        "꺾였다", "떨어졌다", "떨어짐", "추락", "급락세", "연일 하락", "연속 하락", "주춤", "흔들림", "내리막",
        "하락 압력", "부진", "조정", "폭락", "조정 국면", "차익 매물", "하락장", "음봉", "불확실성 확산",
        "하락 위험", "무너짐", "매도세 확산",
        "악재", "실적 부진", "실적 우려", "손실", "영업손실", "적자", "실적 쇼크", "환율 불안", "금리 인상",
        "금리 부담", "경기 침체", "매도세", "외국인 매도", "기관 매도", "공급 과잉", "규제 강화", "금리 리스크",
        "부정적 전망", "기대 이하", "투자심리 위축", "재무 우려", "악성 루머", "기술적 저항", "리스크 부각",
        "테마 약세", "고점 경계감", "물량 부담", "%↓","↓" ,"파산", "회생절차"
    ]

    """
    probs: softmax 확률 분포 (예: [0.1, 0.2, 0.3, 0.4, 0.0])
    text: 뉴스 기사 원문
    alpha: 키워드 반영 강도 (0.0~0.5 사이 추천)

    상승 키워드 → 1, 3 확률 증가 / 0, 2 감소
    하락 키워드 → 0, 2 확률 증가 / 1, 3 감소
    """

    new_probs = probs.copy()
    text = text.lower()

    # ✅ 키워드 개수 세기
    rise_count = sum(1 for kw in rise_keywords if kw in text)
    fall_count = sum(1 for kw in fall_keywords if kw in text)

    # ✅ 둘 다 없는 경우 그대로 반환
    if rise_count == 0 and fall_count == 0:
        return probs

    # ✅ 영향 비율 계산
    total_count = rise_count + fall_count
    rise_ratio = rise_count / total_count
    fall_ratio = fall_count / total_count

    # ✅ 상승 쪽 보정
    new_probs[1] += alpha * rise_ratio  # 소폭 상승
    new_probs[3] += alpha * rise_ratio  # 강력 상승
    new_probs[0] -= alpha * rise_ratio
    new_probs[2] -= alpha * rise_ratio

    # ✅ 하락 쪽 보정
    new_probs[0] += alpha * fall_ratio
    new_probs[2] += alpha * fall_ratio
    new_probs[1] -= alpha * fall_ratio
    new_probs[3] -= alpha * fall_ratio

    # ✅ 음수 방지 + 정규화
    new_probs = [max(0, p) for p in new_probs]
    total = sum(new_probs)
    return [p / total for p in new_probs] if total > 0 else probs


# ✅ 예시 실행
if __name__ == "__main__":
    example_texts = [
        "에이엘티, 한국인증협회 ESG 경영 우수기업 인증 획득",
        "한미반도체 주가 꿈틀...HBM 시장 고속성장에 따라 큰 수혜 예상",
        "美 엔비디아 3.48%↓연일 폭락에 韓 PCB 관련주 '下' 외국인 시노펙스, 태성,...",
        "[특징주] 반도체·이차전지·게임주, 공매도 재개에 동반 '급락'",
        "에이엘티 주가, 폭등... 국내 유일 기술 특허 출원",
    ]
    predictions, probabilities = predict(example_texts)

    for text, pred, prob in zip(example_texts, predictions, probabilities):
        print("\n📰 텍스트:", text)
        print("🔮 예측 클래스:", pred)
        print("📊 확률 분포:", [f"{p:.2f}" for p in prob])
