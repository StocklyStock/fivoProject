from fastapi import APIRouter, Query, HTTPException
from ..utils.stock_lookup import find_symbol
from ..services.supply_service import get_stock_summary, score_supply_demand

router = APIRouter()


@router.get("/stock/supply-risk")
def stock_supply_risk(query: str = Query(..., description="회사명 또는 종목코드")):
    """
    종목의 수급 관련 지표(외국인 지분율, 외국인/기관 순매수량, 회전율)를 기반으로
    리스크 점수(100점 만점)를 계산하고, 리스크 수준을 반환합니다.
    """
    # 종목 코드 조회
    symbol = find_symbol(query)
    if not symbol:
        raise HTTPException(status_code=404, detail="종목을 찾을 수 없습니다.")

    try:
        # 실시간 종목 요약 정보 조회 (수급 관련 데이터 포함)
        summary = get_stock_summary(symbol)

        # 수급 지표 기반 리스크 점수 계산
        score_result = score_supply_demand(summary)

        return {
            "symbol": symbol,
            "risk_score": score_result["total_score"],  # 👉 총점 (100점 기준)
            "risk_level": score_result["risk_level"],  # 👉 리스크 구간 (낮음/보통/높음)
            "score_details": score_result[
                "score_by_metric"
            ],  # 👉 각 지표별 점수 breakdown
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"수급 리스크 점수 계산 실패: {str(e)}"
        )
