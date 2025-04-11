# utils.py

# chatbot/utils.py
from typing import List, Dict
from .mymodel.stock_crawling import latest_news # 실제 서버로 돌릴때
# from mymodel.stock_crawling import latest_news # 테스트 할때
from symspellpy import SymSpell, Verbosity 
import json
import os
from dotenv import load_dotenv
import pandas as pd
import requests


# .env 불러오기
load_dotenv()

def extract_stock_name(msg):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(BASE_DIR, "mymodel", "data", "stock_list.json")
    DATA_PATH = os.path.abspath(DATA_PATH)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        stock_data = json.load(f)

    stock_names = [item["회사명"] for item in stock_data]

    ALIAS_PATH = os.path.join(BASE_DIR, "mymodel", "data", "alias.csv")

    # CSV 불러오기
    alias_df = pd.read_csv(ALIAS_PATH, encoding="utf-8-sig")

    # alias → 정식 종목명 딕셔너리로 바로 변환
    alias_map = dict(zip(alias_df["alias"], alias_df["정식명"]))

    # 0️⃣ 먼저 alias로 바로 매핑 시도
    msg_no_space = msg.replace(" ", "")
    for alias, true_name in alias_map.items():
        if alias in msg_no_space:
            return true_name, None

    # 1️⃣ 정확한 종목명이 포함돼 있으면 바로 반환
    for name in stock_names:
        if name in msg:
            return name, None  # 두 번째는 선택지 없음

    # 2️⃣ SymSpell 초기화
    sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=5)
    for name in stock_names:
        sym_spell.create_dictionary_entry(name, 1)

    # 3️⃣ 공백 제거하고 오타 교정
    msg_no_space = msg.replace(" ", "")

    try:
        suggestions = sym_spell.lookup(msg_no_space, Verbosity.CLOSEST, max_edit_distance=2)
    except ValueError:
        return None, None

    # 4️⃣ 유사 종목 2개 제안
    suggestion_names = [s.term for s in suggestions[:2] if s.term in stock_names]

    if suggestion_names:
        return None, suggestion_names  # 정답은 없고, 선택지만 반환

    return None, None  # 아무것도 못 찾았을 때


def get_latest_news(stock_name: str) -> List[str]:
    """
    종목명을 받아서 최신 뉴스 본문 리스트를 반환
    예시에서는 더미 데이터, 실제론 API 요청 필요
    여기서는 상승 또는 하락만 따질것이므로 0,2가 하락, 1,3이 상승이다.
    이것만 판단되면 바로 return
    """

    news_list_data = latest_news(stock_name) # 뉴스 리스트 받기
    return news_list_data

def class_calculator(predicted_class):
    class_score_map = {
        0: 0.0,   # 완전 하락
        2: 0.15,  # 소폭 하락
        1: 0.35,  # 소폭 상승
        3: 0.5    # 완전 상승
    }
    return class_score_map.get(predicted_class, 0.25)

def get_financial_risks(stock_name: str):
    """
    종목명 기반 종목코드 → FastAPI 서버에 재무 관련 4개 API 요청
    → 0~100 점수를 받아와서 → 리스크 스코어(0~1)로 환산
    """

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(BASE_DIR, "mymodel", "data", "stock_list.json")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        stock_data = json.load(f)

    stock_code = None
    for stock in stock_data:
        if stock["회사명"] == stock_name:
            stock_code = stock["종목코드"]
            break

    if not stock_code:
        raise ValueError(f"[ERROR] '{stock_name}'에 해당하는 종목코드를 찾을 수 없습니다.")

    # 📡 FastAPI 요청 URL 패턴
    BASE_API = "http://fastapi:8001/stock"
    endpoints = {
        "financial": {
            "url": f"{BASE_API}/financial?query={stock_code}",
            "key": "stability_score"  # 예: 재무 안정성 점수
        },
        "profitability": {
            "url": f"{BASE_API}/profitability?query={stock_code}",
            "key": "profitability_score"
        },
        "volatility": {
            "url": f"{BASE_API}/volatility?query={stock_code}",
            "key": "volatility_score"
        },
        "supply_risk": {
            "url": f"{BASE_API}/supply-risk?query={stock_code}",
            "key": "liquidity_score"
        }
    }

    risk_scores = {}

    try:
        for key, info in endpoints.items():
            url = info["url"]
            score_key = info["key"]

            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

            raw_score = data.get(score_key, 50)  # 기본값 50점
            risk_scores[key] = round(1 - (raw_score / 100), 2)

    except requests.RequestException as e:
        raise RuntimeError(f"[ERROR] FastAPI 서버 요청 실패: {e}")

    return {
        "volatility": risk_scores.get("volatility", 0.5),
        "liquidity": risk_scores.get("supply_risk", 0.5),
        "financial": risk_scores.get("financial", 0.5),
        "investor": risk_scores.get("profitability", 0.5)
    }


def interpret_risk_score(score: float) -> str:
    """
    리스크 점수를 사람이 이해할 수 있는 메시지로 변환
    - score는 0(안전) ~ 1(위험) 사이 실수
    """
    if score >= 0.7:
        return f"⚠️ 위험 수준 (점수: {score:.2f})"
    elif score >= 0.4:
        return f"🔶 보통 수준 (점수: {score:.2f})"
    else:
        return f"✅ 안정 수준 (점수: {score:.2f})"


def generate_financial_risk_report(stock_name: str, risk_data: dict) -> str:
    """
    챗봇이 사용자에게 전달할 종합 재무 리스크 분석 메시지를 생성
    risk_data: {volatility, liquidity, financial, investor}
    """

    msg = f"📊 [{stock_name}] 종목의 재무 리스크 분석 결과입니다.\n\n"

    msg += f"📉 변동성(가격 출렁임): {interpret_risk_score(risk_data['volatility'])}\n"
    msg += f"💧 유동성(현금화 가능성): {interpret_risk_score(risk_data['liquidity'])}\n"
    msg += f"💰 재무 안정성(부채, 자산 등): {interpret_risk_score(risk_data['financial'])}\n"
    msg += f"🧠 투자자 동향(수익성, 시장 반응): {interpret_risk_score(risk_data['investor'])}\n"

    avg_score = sum(risk_data.values()) / len(risk_data)
    if avg_score <= 0.3:
        summary = "전반적으로 매우 안정적인 종목이에요. 👍"
    elif avg_score <= 0.6:
        summary = "일부 위험 요소가 있지만 괜찮은 편이에요."
    else:
        summary = "재무적으로 주의가 필요한 종목이에요. ⚠️"
    
    scaled_score = round(avg_score * 0.5, 4)  # 0~1 → 0~0.5 로 변환

    msg += f"\n📌 종합 판단: {summary}"

    return msg,scaled_score

def interpret_score(score):
    if score >= 0.8:
        return "📈 매우 상승 가능성이 높아요"
    elif score >= 0.65:
        return "⬆ 상승 가능성이 있어 보여요"
    elif score >= 0.45:
        return "➖ 보합세일 수 있어요"
    elif score >= 0.3:
        return "⬇ 하락 위험이 있어 보여요"
    else:
        return "📉 크게 하락할 가능성이 있어요"

def generate_news_summary(news_list, predicted_class,risk_msg):
    """
    예시: 뉴스 수 + 예측 클래스 기반 간단 요약 출력
    """
    class_desc = {
        0: "📉 부정적인 뉴스가 많아 하락 가능성이 있습니다.",
        1: "⬆ 약간의 긍정 뉴스가 있어요.",
        2: "⬇ 약간의 부정 뉴스가 있습니다.",
        3: "📈 긍정적인 뉴스가 다수 포착됐어요.",
        4: "❔ 판단이 애매한 뉴스가 많아요."
    }
    return f"{len(news_list)}건의 뉴스 기반 예측: {class_desc.get(predicted_class, '정보 없음')}\n{risk_msg}"


if __name__ == "__main__":
    print(extract_stock_name("밍동 항공"))