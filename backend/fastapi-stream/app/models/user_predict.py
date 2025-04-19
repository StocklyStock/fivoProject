from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base  # 기존 Base 그대로 사용

class UserPredictedStock(Base):
    __tablename__ = "user_predict"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    stock_code = Column(String)
    company_name = Column(String)
    predicted_label = Column(String)
    positive_news = Column(JSONB, nullable=True)
    risk_score = Column(JSONB)
    final_score = Column(JSONB)
    created_at = Column(DateTime)
