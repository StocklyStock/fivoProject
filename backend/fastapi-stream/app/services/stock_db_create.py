import os
import json
import time
import requests
from dotenv import load_dotenv
from app.core.token_manager import get_access_token

# ✅ .env 환경 변수 로딩
load_dotenv()

# ✅ 파일 경로 정의
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
INPUT_FILE = os.path.join(DATA_DIR, "stock_list.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "stock_list_with_sector.json")


# ✅ API 요청용 헤더 구성 함수
def build_headers(token: str):
    return {
        "content-type": "application/json",
        "authorization": f"Bearer {token}",
        "appkey": os.getenv("APP_KEY"),
        "appsecret": os.getenv("APP_SECRET"),
        "tr_id": "CTPF1002R",
        "custtype": "P",
    }


# ✅ 업종 조회 함수 (빈값도 "기타" 처리 포함)
def get_sector_by_kis(symbol: str, headers: dict) -> str:
    base_url = os.getenv("BASE_URL")
    url = f"{base_url}/uapi/domestic-stock/v1/quotations/search-stock-info?PDNO={symbol}&PRDT_TYPE_CD=300"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        raw_sector = data.get("output", {}).get("std_idst_clsf_cd_name", "")
        return raw_sector.strip() if raw_sector else "기타"
    except Exception as e:
        print(f"❌ {symbol} 업종 조회 실패: {e}")
        return "기타"


# ✅ 메인 실행 함수
def update_stock_list_with_sector():
    # 1. 종목 리스트 불러오기
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        stock_list = json.load(f)

    # 2. 토큰 발급
    token = get_access_token()
    if not token:
        print("❌ 액세스 토큰 발급 실패")
        return

    headers = build_headers(token)

    # 3. 순회하며 업종 정보 추가
    updated_list = []
    for i, stock in enumerate(stock_list):
        code = stock["종목코드"]
        sector = get_sector_by_kis(code, headers)

        updated_list.append(
            {
                "회사명": stock["회사명"],
                "종목코드": code,
                "시장구분": stock["시장구분"],
                "업종": sector
            }
        )

        print(f"✅ [{i+1}/{len(stock_list)}] {stock['회사명']} - {sector}")
        if (i + 1) % 10 == 0:
            time.sleep(1)  # KIS API 요청 제한 회피

    # 4. 저장
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_list, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 저장 완료: {OUTPUT_FILE}")


# ✅ 실행
if __name__ == "__main__":
    update_stock_list_with_sector()
