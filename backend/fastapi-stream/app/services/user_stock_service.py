import os
import sys
import json
import time
import importlib.util
from datetime import datetime
from app.database import SessionLocal
from app.models.user_predict import UserPredictedStock
from app.services.calculate_risk_score_for_predict import calculate_risk_score_for_stock

# 📌 현재 이 파일 위치
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ✅ 장고 chatbot/mymodel 경로 (정확하게)
MYMODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "../../../django-api/chatbot/mymodel")
)

# ✅ 경로를 Python path에 추가 (혹시 모듈 import로 쓸 경우 대비)
DJANGO_ROOT = os.path.abspath(os.path.join(BASE_DIR, "../../../django-api"))
sys.path.append(DJANGO_ROOT)


# ✅ 동적 import 함수
def import_from_file(filepath, function_name):
    spec = importlib.util.spec_from_file_location("dynamic_module", filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, function_name)


# ✅ 함수 경로 지정 및 불러오기
DJANGO_PREDICT_PATH = os.path.join(MYMODEL_PATH, "predict_stock_news_class.py")
DJANGO_CRAWLING_PATH = os.path.join(MYMODEL_PATH, "stock_crawling.py")
predict = import_from_file(DJANGO_PREDICT_PATH, "predict")
latest_news = import_from_file(DJANGO_CRAWLING_PATH, "fetch_structured_news")


# ✅ 코드 ↔ 이름 맵핑 로드 함수
def load_code_to_name_map():
    DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "../data/stock_list.json"))
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        stock_data = json.load(f)
    return {item["종목코드"]: item["회사명"] for item in stock_data}


# ✅ 뉴스 기반 예측
def predict_by_sector_selected_stocks(selected_codes):
    results = []
    code_to_name = load_code_to_name_map()

    for stock_code in selected_codes:
        company_name = code_to_name.get(stock_code)
        if not company_name:
            continue

        news_list = latest_news(company_name)
        if not news_list:
            continue

        all_probs = []
        class_3_articles = []

        for article in news_list:
            text = article["title"] + " " + article["summary"]
            preds, probs = predict(text)
            pred_class = preds[0]
            prob_dist = probs[0][:4]
            all_probs.append(prob_dist)

            if pred_class == 3:
                class_3_articles.append(
                    {
                        "title": article["title"],
                        "summary": article["summary"],
                        "url": article["url"],
                        "prob": float(prob_dist[3]),
                    }
                )

        if not all_probs:
            continue

        avg_probs = [sum(p[i] for p in all_probs) / len(all_probs) for i in range(4)]
        predicted_class = avg_probs.index(max(avg_probs))

        results.append(
            {
                "stock_code": stock_code,
                "company": company_name,
                "class_prediction": predicted_class,
                "positive_news": class_3_articles,
            }
        )

    return results


# ✅ 전체 실행 함수
def run_custom_prediction(user_id: int, selected_codes: list):
    print(f"📌 [예측 시작] 사용자({user_id}) 선택 종목 예측 중...")
    session = SessionLocal()
    results = predict_by_sector_selected_stocks(selected_codes)

    for i, r in enumerate(results):
        symbol = r["stock_code"]
        name = r["company"]

        risk_result = calculate_risk_score_for_stock(symbol, name)
        if risk_result is None:
            continue

        session.add(
            UserPredictedStock(
                user_id=user_id,
                stock_code=symbol,
                company_name=name,
                predicted_label=r["class_prediction"],
                positive_news=r["positive_news"],
                risk_score=risk_result["risk_scores"],
                final_score=risk_result["final_scores"],
                created_at=datetime.now(),
            )
        )

        print(f"✅ [{i + 1}/{len(results)}] {name} 저장 완료")

        if (i + 1) % 5 == 0:
            print("⏱️ 요청 제한으로 1초 대기 중...")
            time.sleep(1)

    session.commit()
    session.close()
    print(f"🎯 사용자({user_id})의 종목 예측 결과 DB 저장 완료")


# ✅ 단독 실행용
if __name__ == "__main__":
    test_user_id = 6
    test_codes = [
        "302440",
        "310210",
        "331920",
        "127710",
        "196300",
        "432980",
        "456070",
        "191420",
        "214390",
        "187420",
        "263050",
        "314130",
        "217730",
        "298380",
        "373110",
        "182400",
        "145020",
        "251120",
        "288330",
        "183490",
        "256840",
        "143240",
        "378800",
        "225220",
        "214370",
        "200130",
        "246710",
        "207940",
        "244460",
        "102940",
        "950160",
        "300080",
        "106190",
        "114450",
        "239340",
        "134580",
        "475830",
    ]
    run_custom_prediction(test_user_id, test_codes)
