import os
import json
import time
from dotenv import load_dotenv

from app.services.volatility_service import get_volatility
from app.services.supply_service import get_stock_summary, score_supply_demand
from app.services.profitability_service import get_profitability_ratios
from app.services.financial_service import get_financial_ratios

load_dotenv()

# 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
INPUT_FILE = os.path.join(DATA_DIR, "stock_list_with_sector.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "stock_with_risk_score.json")

# 투자 성향별 가중치
WEIGHTS = {
    "공격형": {"안정성": 0.2, "수익성": 0.4, "변동성": 0.3, "수급": 0.1},
    "중립형": {"안정성": 0.3, "수익성": 0.3, "변동성": 0.25, "수급": 0.15},
    "안정형": {"안정성": 0.5, "수익성": 0.3, "변동성": 0.1, "수급": 0.1},
}


def calculate_final_scores(metric_scores: dict) -> dict:
    result = {}
    for style, weights in WEIGHTS.items():
        score = sum(metric_scores[k] * weights.get(k, 0) for k in metric_scores)
        result[style] = round(score, 2)
    return result


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        stock_list = json.load(f)

    updated_list = []

    for i, stock in enumerate(stock_list):
        symbol = stock["종목코드"]
        name = stock["회사명"]

        try:
            # 1. 변동성 점수
            volatility_data = get_volatility(symbol)
            volatility_score = volatility_data["volatility_score"]

            # 2. 수급 점수
            summary_data = get_stock_summary(symbol)
            demand_data = score_supply_demand(summary_data)
            demand_score = demand_data["total_score"]

            # 3. 수익성 점수
            profitability_data = get_profitability_ratios(symbol)
            profitability_score = profitability_data["profitability_score"]

            # 4. 재무 안정성 점수
            stability_data = get_financial_ratios(symbol)
            stability_score = stability_data["stability_score"]

            # 종합 점수 계산
            metric_scores = {
                "안정성": stability_score,
                "수익성": profitability_score,
                "변동성": volatility_score,
                "수급": demand_score,
            }

            final_scores = calculate_final_scores(metric_scores)

            stock.update({"리스크_점수": metric_scores, "최종점수": final_scores})

            updated_list.append(stock)
            print(f"✅ [{i+1}/{len(stock_list)}] {name} 처리 완료")

            if (i + 1) % 5 == 0:
                time.sleep(1)

        except Exception as e:
            print(f"❌ [{i+1}] {name}({symbol}) 실패: {e}")
            continue

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_list, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 저장 완료: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
