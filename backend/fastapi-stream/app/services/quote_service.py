import os
import requests
from ..core.token_manager import get_access_token
from dotenv import load_dotenv

load_dotenv()


def get_stock_summary(symbol: str) -> dict:
    def safe_int(value) -> int:
        try:
            return int(
                str(value)
                .replace(",", "")
                .replace(" ", "")
                .replace("억", "")
                .replace("조", "")
            )
        except:
            return 0

    def safe_float(value) -> float:
        try:
            return float(str(value).replace(",", "").replace("%", ""))
        except:
            return 0.0

    token = get_access_token()

    url = f"{os.getenv('BASE_URL')}/uapi/domestic-stock/v1/quotations/inquire-price"
    params = {
        "fid_cond_mrkt_div_code": "J",
        "fid_input_iscd": symbol,
    }

    headers = {
        "content-type": "application/json",
        "authorization": f"Bearer {token}",
        "appkey": os.getenv("APP_KEY"),
        "appsecret": os.getenv("APP_SECRET"),
        "tr_id": "FHKST01010100",
        "custtype": "P",
    }

    response = requests.get(url, headers=headers, params=params)
    res_json = response.json()

    if res_json.get("rt_cd") != "0":
        raise Exception(f"API 오류: {res_json}")

    output = res_json.get("output", {})

    return {
        "symbol": symbol,
        "price": safe_int(output.get("stck_prpr")),
        "change": safe_int(output.get("prdy_vrss")),
        "change_rate": safe_float(output.get("prdy_ctrt")),
        "open": safe_int(output.get("stck_oprc")),
        "high": safe_int(output.get("stck_hgpr")),
        "low": safe_int(output.get("stck_lwpr")),
        "previous_close": safe_int(output.get("stck_sdpr")),
        "volume": safe_int(output.get("acml_vol")),
        "trade_amount": safe_int(output.get("acml_tr_pbmn")),
    }
