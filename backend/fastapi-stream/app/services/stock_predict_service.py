import importlib.util
import os
import json
import sys
from app.models.predicted_stock import PredictedStock
from app.database import SessionLocal
from datetime import datetime

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

# ✅ 함수 경로 지정
DJANGO_PREDICT_PATH = os.path.join(MYMODEL_PATH, "predict_stock_news_class.py")
DJANGO_CRAWLING_PATH = os.path.join(MYMODEL_PATH, "stock_crawling.py")

# ✅ 함수 불러오기
predict = import_from_file(DJANGO_PREDICT_PATH, "predict")
latest_news = import_from_file(DJANGO_CRAWLING_PATH, "latest_news")

# ✅ 핵심 함수: 예측 수행
def predict_high_volatility_stocks():
    data_path = os.path.join(BASE_DIR, "../data/high_volatility_stocks.json")

    with open(data_path, "r", encoding="utf-8") as f:
        stocks = json.load(f)

    results = []

    for stock in stocks:
        company_name = stock["회사명"]
        stock_code = stock["종목코드"]
        news_list = latest_news(company_name)

        if not news_list:
            continue

        news_probs_list = []
        for article in news_list:
            preds, probs = predict(article)
            pred_class = preds[0]
            prob_dist = probs[0][:4]  # 4개 클래스 확률만 사용

            news_probs_list.append(prob_dist)

        # 평균 확률로 최종 클래스 선택
        avg_probs = [sum(p[i] for p in news_probs_list) / len(news_probs_list) for i in range(4)]
        predicted_class = avg_probs.index(max(avg_probs))

        results.append({
            "stock_code": stock_code,
            "company": company_name,
            "class_prediction": predicted_class,
        })

    return results

def run_daily_prediction():
    print("📌 [예측 시작] 고변동성 종목 예측 중...")
    session = SessionLocal()
    
    session.query(PredictedStock).delete()
    session.commit()
    
    results = predict_high_volatility_stocks()

    for r in results:
        session.add(PredictedStock(
            stock_code=r["stock_code"],
            company_name=r["company"],
            predicted_label=r["class_prediction"],
            created_at=datetime.now()
        ))

    session.commit()
    session.close()
    print("✅ [예측 완료] DB에 저장됨.")

# ✅ 단독 실행 확인용
if __name__ == "__main__":
    run_daily_prediction()
