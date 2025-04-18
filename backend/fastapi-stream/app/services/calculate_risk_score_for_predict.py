
import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv

from app.services.volatility_service import get_volatility
from app.services.supply_service import get_stock_summary, score_supply_demand
from app.services.profitability_service import get_profitability_ratios
from app.services.financial_service import get_financial_ratios

# ✅ 환경 변수 로딩
load_dotenv()

# ✅ 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
INPUT_FILE = DATA_DIR / "stock_list_with_sector.json"
OUTPUT_FILE = DATA_DIR / "stock_with_risk_score.json"

# ✅ 투자자 성향별 가중치
WEIGHTS = {
    "공격형": {"안정성": 0.2, "수익성": 0.4, "변동성": 0.3, "수급": 0.1},
    "중립형": {"안정성": 0.3, "수익성": 0.3, "변동성": 0.25, "수급": 0.15},
    "안정형": {"안정성": 0.5, "수익성": 0.3, "변동성": 0.1, "수급": 0.1},
}


# ✅ 최종 점수 계산
def calculate_final_scores(metric_scores: dict) -> dict:
    result = {}
    for style, weights in WEIGHTS.items():
        score = sum(metric_scores[k] * weights.get(k, 0) for k in metric_scores)
        result[style] = round(score, 2)
    return result


# ✅ 단일 종목에 대한 리스크 점수 계산
def calculate_risk_score_for_stock(symbol: str, name: str) -> dict:
    try:
        # 1. 변동성
        volatility_data = get_volatility(symbol)
        volatility_score = volatility_data["volatility_score"]

        # 2. 수급
        summary_data = get_stock_summary(symbol)
        demand_data = score_supply_demand(summary_data)
        demand_score = demand_data["total_score"]

        # 3. 수익성
        profitability_data = get_profitability_ratios(symbol)
        profitability_score = profitability_data["profitability_score"]

        # 4. 안정성
        stability_data = get_financial_ratios(symbol)
        stability_score = stability_data["stability_score"]

        # 5. 종합 점수 계산
        metric_scores = {
            "안정성": stability_score,
            "수익성": profitability_score,
            "변동성": volatility_score,
            "수급": demand_score,
        }

        final_scores = calculate_final_scores(metric_scores)

        return {
            "symbol": symbol,
            "company_name": name,
            "risk_scores": metric_scores,
            "final_scores": final_scores,
        }

    except Exception as e:
        print(f"❌ {name}({symbol}) 리스크 점수 계산 실패: {e}")
        return None


# ✅ 외부에서 import 해서 사용할 수 있는 함수
def calculate_and_save_risk_scores(limit: int = None):
    print("📁 stock_list_with_sector.json 로딩 중...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        stock_list = json.load(f)

    if limit:
        stock_list = stock_list[:limit]
        print(f"🔎 테스트 모드: 상위 {limit}개 종목만 처리합니다.\n")

    updated_list = []

    for i, stock in enumerate(stock_list):
        symbol = stock["종목코드"]
        name = stock["회사명"]

        result = calculate_risk_score_for_stock(symbol, name)
        if result:
            stock.update({
                "리스크_점수": result["risk_scores"],
                "최종점수": result["final_scores"]
            })
            updated_list.append(stock)
            print(f"✅ [{i+1}/{len(stock_list)}] {name} 처리 완료")
        else:
            print(f"❌ [{i+1}] {name} 실패")

        if (i + 1) % 5 == 0:
            time.sleep(1)  # 요청 제한 회피

    print(f"\n📝 결과 저장 중 → {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_list, f, ensure_ascii=False, indent=2)

    print(f"🎉 저장 완료: 총 {len(updated_list)}개 종목이 저장되었습니다.")


# ✅ 단독 실행
if __name__ == "__main__":
    calculate_and_save_risk_scores(limit=10)  # 테스트 실행 시 상위 10개만 처리
