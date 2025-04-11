import os
import requests
from dotenv import load_dotenv
from ..core.token_manager import get_access_token

load_dotenv()

# 한국투자증권 API 요청 처리

def fetch_candles(symbol: str, timeframe: str = "daily"):
    token = get_access_token()

    # 기간 구분 코드 매핑
    period_code_map = {
        "daily": "D",
        "weekly": "W",
        "monthly": "M"
    }

    params = {
        "fid_cond_mrkt_div_code": "J",  # KRX 시장
        "fid_input_iscd": symbol,       # 종목코드 ex) 005930
        "fid_period_div_code": period_code_map.get(timeframe, "D"),
        "fid_org_adj_prc": "1"          # 수정주가 반영
    }

    headers = {
        "content-type": "application/json",
        "authorization": f"Bearer {token}",
        "appkey": os.getenv("APP_KEY"),
        "appsecret": os.getenv("APP_SECRET"),
        "tr_id": "FHKST01010400",   # 실전용 일자별 시세조회 TR_ID
        "custtype": "P"
    }

    url = f"{os.getenv('BASE_URL')}/uapi/domestic-stock/v1/quotations/inquire-daily-price"

    try:
        response = requests.get(url, headers=headers, params=params)
        res_json = response.json()

        print("🔗 요청 URL:", response.url)
        print("📦 응답 데이터:", res_json)

        if res_json.get("rt_cd") == "0":
            return res_json.get("output", [])
        else:
            print("❌ API 오류:", res_json)
            return []
    except Exception as e:
        print("❌ 예외 발생:", e)
        return []
