# fastapi-stream/app/services/save_high_volatility_to_file.py

import json
import asyncio
from pathlib import Path
import sys

# app 루트 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from services.volatility_service import get_volatility  # 변동성 점수 계산 함수
from concurrent.futures import ThreadPoolExecutor

# 파일 경로 설정
DATA_DIR = BASE_DIR / "data"
STOCK_LIST_FILE = DATA_DIR / "stock_list.json"
OUTPUT_FILE = DATA_DIR / "high_volatility_stocks.json"

# 동기 -> 비동기 변환용 실행자
executor = ThreadPoolExecutor()


# 비동기로 변환된 fetch 함수
async def fetch_volatility_async(stock):
    loop = asyncio.get_event_loop()
    symbol = stock["종목코드"]
    name = stock["회사명"]
    try:
        result = await loop.run_in_executor(executor, get_volatility, symbol)
        score = result["volatility_score"]
        if score >= 70:
            print(f"✅ {name}({symbol}) → {score}점")
            return {"종목코드": symbol, "회사명": name, "변동성점수": score}
        else:
            print(f"➖ {name}({symbol}) → {score}점 (기준 미달)")
    except Exception as e:
        print(f"❌ {name}({symbol}) 오류: {e}")
    return None


# 메인 실행 함수
async def main():
    print("📁 stock_list.json 로딩 중...")
    with open(STOCK_LIST_FILE, "r", encoding="utf-8") as f:
        stock_list = json.load(f)

    high_vol_stocks = []
    chunk_size = 10

    print(f"🔍 총 {len(stock_list)}개 종목에 대해 변동성 점수 계산 시작...\n")

    for i in range(0, len(stock_list), chunk_size):
        chunk = stock_list[i : i + chunk_size]
        tasks = [fetch_volatility_async(stock) for stock in chunk]
        results = await asyncio.gather(*tasks)
        high_vol_stocks.extend([res for res in results if res is not None])
        await asyncio.sleep(1)  # 1초 간격으로 제한

    print(f"\n📝 결과 저장 중 → {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(high_vol_stocks, f, ensure_ascii=False, indent=2)

    print(f"🎉 저장 완료: 총 {len(high_vol_stocks)}개 종목이 저장되었습니다.")


# 실행 시작
if __name__ == "__main__":
    asyncio.run(main())
