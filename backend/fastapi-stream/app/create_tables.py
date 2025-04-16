from database import engine
from models.predicted_stock import PredictedStock

# 테이블 생성
PredictedStock.metadata.create_all(bind=engine)
