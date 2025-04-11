from fastapi import APIRouter, Query, HTTPException
from ..utils.stock_lookup import find_symbol
from ..services.volatility_service import get_volatility

router = APIRouter()


@router.get("/stock/volatility")
def stock_volatility(query: str = Query(..., description="회사명 또는 종목코드")):
    """
    종목의 변동성 관련 지표를 기반으로 점수 및 리스크 수준을 반환합니다.
    """
    symbol = find_symbol(query)
    if not symbol:
        raise HTTPException(status_code=404, detail="종목을 찾을 수 없습니다.")

    try:
        result = get_volatility(symbol)

        return {
            "symbol": symbol,
            "volatility_score": result["volatility_score"],
            "risk_level": result["risk_level"],
            "raw_data": result["raw_data"],
            "score_details": result["score_details"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
