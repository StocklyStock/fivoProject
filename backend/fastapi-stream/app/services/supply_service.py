import os
import requests
from dotenv import load_dotenv
from ..core.token_manager import get_access_token

load_dotenv()


# ✅ 수급 점수 계산 함수 (100점 만점, 수치 기반 평가)
def score_supply_demand(data: dict) -> dict:
    def safe_float(val):
        try:
            return float(val)
        except:
            return 0.0

    def safe_int(val):
        try:
            return int(val)
        except:
            return 0

    def score_foreign_ratio(val):  # 외국인 지분율
        val = safe_float(val)
        if val >= 50:
            return 30
        elif val >= 40:
            return 25
        elif val >= 30:
            return 20
        elif val >= 20:
            return 10
        else:
            return 5

    def score_net_buy(qty):  # 순매수량
        qty = safe_int(qty)
        if qty > 1_000_000:
            return 25
        elif qty > 100_000:
            return 20
        elif qty > 0:
            return 15
        elif qty > -100_000:
            return 5
        else:
            return 0

    def score_turnover(val):  # 회전율
        val = safe_float(val)
        if 0.1 <= val <= 2.0:
            return 20
        elif val <= 5.0:
            return 10
        else:
            return 5

    # 개별 점수 계산
    score1 = score_foreign_ratio(data.get("hts_frgn_ehrt"))
    score2 = score_net_buy(data.get("frgn_ntby_qty"))
    score3 = score_net_buy(data.get("pgtr_ntby_qty"))
    score4 = score_turnover(data.get("vol_tnrt"))

    total_score = score1 + score2 + score3 + score4

    return {
        "score_by_metric": [
            {
                "label": "외국인 지분율",
                "value": safe_float(data.get("hts_frgn_ehrt")),
                "score": score1,
            },
            {
                "label": "외국인 순매수",
                "value": safe_int(data.get("frgn_ntby_qty")),
                "score": score2,
            },
            {
                "label": "기관 순매수",
                "value": safe_int(data.get("pgtr_ntby_qty")),
                "score": score3,
            },
            {
                "label": "회전율(유동성)",
                "value": safe_float(data.get("vol_tnrt")),
                "score": score4,
            },
        ],
        "total_score": round(total_score, 2),
        "risk_level": (
            "낮음" if total_score >= 70 else "보통" if total_score >= 40 else "높음"
        ),
    }


# ✅ 종목 실시간 요약 데이터 (수급용 필드 포함)
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
        # ✅ 수급 점수에 필요한 필드
        "hts_frgn_ehrt": safe_float(output.get("hts_frgn_ehrt")),  # 외국인 지분율
        "frgn_ntby_qty": safe_int(output.get("frgn_ntby_qty")),  # 외국인 순매수량
        "pgtr_ntby_qty": safe_int(output.get("pgtr_ntby_qty")),  # 기관 순매수량
        "vol_tnrt": safe_float(output.get("vol_tnrt")),  # 회전율
    }
