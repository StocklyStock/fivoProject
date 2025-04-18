from database import engine
# from models.predicted_stock import PredictedStock
from models.user_predict import UserPredictedStock

# 테이블 생성
# PredictedStock.metadata.create_all(bind=engine)
UserPredictedStock.metadata.create_all(bind=engine)
