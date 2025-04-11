from fastapi import APIRouter, Query, HTTPException
from ..utils.stock_lookup import find_symbol
from ..services.financial_service import get_financial_ratios

router = APIRouter()


@router.get("/stock/financial")
def stock_financial(query: str = Query(..., description="회사명 또는 종목코드")):
    """
    종목의 재무 안정성 점수 및 리스크 수준을 반환합니다.
    """
    symbol = find_symbol(query)
    if not symbol:
        raise HTTPException(status_code=404, detail="종목을 찾을 수 없습니다.")

    try:
        result = get_financial_ratios(symbol)
        return {
            "symbol": result["symbol"],
            "report_date": result["report_date"],
            "stability_score": result["stability_score"],
            "risk_level": result["risk_level"],
            "raw_data": result["raw_data"],
            "score_details": result["score_details"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
