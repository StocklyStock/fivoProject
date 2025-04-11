from fastapi import APIRouter, Query, HTTPException
from ..services.quote_service import get_stock_summary
from ..utils.stock_lookup import find_symbol  # query → 종목코드 매핑

router = APIRouter()


@router.get("/stock/summary")
def stock_summary(query: str = Query(..., description="회사명 또는 종목코드")):
    symbol = find_symbol(query)
    if not symbol:
        raise HTTPException(status_code=404, detail="종목을 찾을 수 없습니다.")

    try:
        return get_stock_summary(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
