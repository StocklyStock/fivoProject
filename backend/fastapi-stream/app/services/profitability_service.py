import os
import requests
from dotenv import load_dotenv
from ..core.token_manager import get_access_token

load_dotenv()


def score_profitability(data: dict) -> dict:
    def safe_float(val):
        try:
            return float(str(val).replace(",", "").replace("%", ""))
        except:
            return None

    def score_roe(val):  # ROE (높을수록 좋음)
        if val is None:
            return 0
        if val >= 15:
            return 30
        elif val >= 10:
            return 20
        elif val >= 5:
            return 10
        else:
            return 0

    def score_roa(val):  # ROA (높을수록 좋음)
        if val is None:
            return 0
        if val >= 10:
            return 30
        elif val >= 7:
            return 20
        elif val >= 4:
            return 10
        else:
            return 0

    def score_op_margin(val):  # 영업이익률 (높을수록 좋음)
        if val is None:
            return 0
        if val >= 20:
            return 20
        elif val >= 10:
            return 10
        elif val >= 5:
            return 5
        else:
            return 0

    def score_net_margin(val):  # 순이익률 (높을수록 좋음)
        if val is None:
            return 0
        if val >= 15:
            return 20
        elif val >= 10:
            return 10
        elif val >= 5:
            return 5
        else:
            return 0

    # 값 파싱
    roe = safe_float(data.get("self_cptl_ntin_inrt"))
    roa = safe_float(data.get("tot_assets_ntin_rate"))
    op_margin = safe_float(data.get("sale_totl_rate"))
    net_margin = safe_float(data.get("sale_ntin_rate"))

    # 개별 점수 계산
    score1 = score_roe(roe)
    score2 = score_roa(roa)
    score3 = score_op_margin(op_margin)
    score4 = score_net_margin(net_margin)

    total_score = score1 + score2 + score3 + score4

    risk_level = (
        "우수" if total_score >= 80 else "보통" if total_score >= 50 else "취약"
    )

    return {
        "score_by_metric": [
            {"label": "ROE", "value": roe, "score": score1},
            {"label": "ROA", "value": roa, "score": score2},
            {"label": "영업이익률", "value": op_margin, "score": score3},
            {"label": "순이익률", "value": net_margin, "score": score4},
        ],
        "total_score": total_score,
        "risk_level": risk_level,
    }


def get_profitability_ratios(symbol: str) -> dict:
    token = get_access_token()

    url = f"{os.getenv('BASE_URL')}/uapi/domestic-stock/v1/finance/profit-ratio"
    params = {
        "fid_cond_mrkt_div_code": "J",
        "fid_input_iscd": symbol,
        "fid_div_cls_code": "1",
    }

    headers = {
        "content-type": "application/json",
        "authorization": f"Bearer {token}",
        "appkey": os.getenv("APP_KEY"),
        "appsecret": os.getenv("APP_SECRET"),
        "tr_id": "FHKST66430400",
        "custtype": "P",
    }

    res = requests.get(url, headers=headers, params=params)
    res_json = res.json()

    if res_json.get("rt_cd") != "0":
        raise Exception(f"API 오류: {res_json}")

    output = res_json.get("output", [])
    latest = output[0] if output else {}

    score_result = score_profitability(latest)

    return {
        "symbol": symbol,
        "report_date": latest.get("stac_yymm"),
        "profitability_score": round(score_result["total_score"], 2),
        "raw_data": {
            "roe": latest.get("self_cptl_ntin_inrt"),
            "roa": latest.get("tot_assets_ntin_rate"),
            "operating_margin": latest.get("sale_totl_rate"),
            "net_margin": latest.get("sale_ntin_rate"),
        },
        "score_details": score_result["score_by_metric"],
        "risk_level": score_result["risk_level"],
    }
