from typing import List
from fastapi import HTTPException
import os, json
from datetime import datetime

from app.models.user_predict import UserPredictedStock
from app.database import SessionLocal
from app.services.stock_predict_service import predict_by_sector_selected_stocks  # 모델 예측 로직
from app.services.calculate_risk_score_for_predict import calculate_risk_score_for_stock

def run_sector_prediction_by_codes(codes: List[str]):
    try:
        # 1. 상세정보 로딩
        json_path = os.path.join(os.path.dirname(__file__), "../../../django-api/dummy/stock_list_with_sector.json")
        with open(json_path, "r", encoding="utf-8") as f:
            full_stock_data = json.load(f)

        # 2. 코드 기준 필터링
        selected_stocks = [item for item in full_stock_data if item["종목코드"] in codes]
        if not selected_stocks:
            raise HTTPException(status_code=404, detail="전달된 종목코드에 해당하는 정보가 없습니다.")

        # 3. 예측 실행
        results = predict_by_sector_selected_stocks(selected_stocks)

        # 리스크 분석 점수 함수 추가해야함
        
        # 4. 저장
        session = SessionLocal()
        session.query(UserPredictedStock).delete()
        session.commit()

        for r in results:
            session.add(UserPredictedStock(
                stock_code=r["stock_code"],
                company_name=r["company"],
                predicted_label=r["class_prediction"],
                positive_news=r["positive_news"],
                risk_score=r["risk_score"],
                final_score=r["final_score"],
                created_at=datetime.now()
            ))

        session.commit()
        session.close()

        return {"status": "ok", "saved_count": len(results)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
