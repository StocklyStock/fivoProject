from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.user_stock_service import predict_by_sector

router = APIRouter()

class StockCodeList(BaseModel):
    codes: List[str]

@router.post("/predict/by-sector")
def predict_by_sector(payload: StockCodeList):
    return predict_by_sector(payload.codes)