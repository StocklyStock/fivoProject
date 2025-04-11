from fastapi import APIRouter, Query, HTTPException
from ..utils.stock_lookup import find_symbol
from ..services.profitability_service import get_profitability_ratios

router = APIRouter()


@router.get("/stock/profitability")
def stock_profitability(query: str = Query(..., description="회사명 또는 종목코드")):
    """
    종목의 수익성 점수 및 리스크 수준을 반환합니다.
    """
    symbol = find_symbol(query)
    if not symbol:
        raise HTTPException(status_code=404, detail="종목을 찾을 수 없습니다.")

    try:
        result = get_profitability_ratios(symbol)
        return {
            "symbol": result["symbol"],
            "report_date": result["report_date"],
            "profitability_score": result["profitability_score"],
            "risk_level": result["risk_level"],
            "raw_data": result["raw_data"],
            "score_details": result["score_details"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
