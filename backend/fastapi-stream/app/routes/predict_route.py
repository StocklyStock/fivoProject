from fastapi import APIRouter
from ..services.stock_predict_service import predict_high_volatility_stocks

router = APIRouter()

@router.get("/predict/high-volatility")
async def get_high_volatility_predictions():
    return predict_high_volatility_stocks()