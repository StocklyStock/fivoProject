from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .services.chart_service import get_chart_data
from .utils.stock_lookup import find_symbol
from .routes import stock_list_route  # 👉 종목 리스트 라우트
from .routes import stock_summary_route  # 주식 최소 정보카드
from .routes import (
    financial_route,
)  # 주식 재무제표 기준 리스크 분석(안정성 비율 -> 가중치 계산 포함)
from .routes import (
    profitability_route,
)  # 주식 재무제표 기준 리스크 분석(수익성 비율 -> 가중치 계산 포함)
from .routes import (
    volatility_route,
)  # 주식 재무제표 기준 리스크 분석(변동성 비율 -> 가중치 계산 포함)
from .routes import (
    supply_route,
)  # 주식 재무제표 기준 리스크 분석(외국인 매매 동향(수급) -> 가중치 계산 포함)

from fastapi import FastAPI
from .routes import theme_route
from .routes import predict_route
from app.scheduler import start as start_scheduler

app = FastAPI(
    docs_url="/api/docs",             # Swagger UI (기존: /docs → 변경)
    redoc_url=None,                   # 필요 없으면 redoc 비활성화
    openapi_url="/api/openapi.json"   # OpenAPI JSON (기존: /openapi.json → 변경)
)

app = FastAPI()

# ✅ 앱 시작 시 스케줄러도 함께 시작
@app.on_event("startup")
def startup_event():
    start_scheduler()

# ✅ CORS 설정 (Vite 프론트엔드 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중이므로 * 허용. 배포 시 도메인 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 종목 리스트 라우트 등록 (/stocks)
app.include_router(stock_list_route.router)
app.include_router(financial_route.router)
app.include_router(stock_summary_route.router)
app.include_router(profitability_route.router)
app.include_router(volatility_route.router)
app.include_router(supply_route.router)

app.include_router(theme_route.router)  # 🆕 테마 뉴스 & 실시간 트리맵
app.include_router(predict_route.router, prefix="/api")

# ✅ 차트 데이터 API
@app.get("/chart/{timeframe}")
def fetch_chart(query: str, timeframe: str = "daily"):
    """
    회사명 또는 종목코드를 받아서 차트 데이터 반환
    ex) /chart/daily?query=삼성전자 or /chart/weekly?query=005930
    """
    symbol = find_symbol(query)
    if not symbol:
        raise HTTPException(status_code=404, detail="해당 종목을 찾을 수 없습니다.")
    return get_chart_data(symbol, timeframe)
