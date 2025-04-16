# app/models/predicted_stock.py

from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class PredictedStock(Base):
    __tablename__ = "predicted_stocks"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String, index=True)
    company_name = Column(String)
    predicted_label = Column(String)  # 0~3 예측 클래스
    created_at = Column(DateTime)
