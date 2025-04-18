from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base  # 기존 Base 그대로 사용

class UserPredictedStock(Base):
    __tablename__ = "user_predict"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String)
    company_name = Column(String)
    predicted_label = Column(Integer)
    positive_news = Column(JSON)
    
    risk_score = Column(JSON)
    final_score = Column(JSON)
    
    created_at = Column(DateTime)