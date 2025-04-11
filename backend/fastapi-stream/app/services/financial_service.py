import os
import requests
from dotenv import load_dotenv
from ..core.token_manager import get_access_token

load_dotenv()


def score_financial_stability(data: dict) -> dict:
    def safe_float(val):
        try:
            return float(str(val).replace(",", ""))
        except:
            return None

    def score_lblt_rate(val):  # 부채비율 (낮을수록 좋음)
        if val is None:
            return 0
        if val <= 100:
            return 30
        elif val <= 150:
            return 20
        elif val <= 200:
            return 10
        else:
            return 0

    def score_bram_depn(val):  # 고정비율 (낮을수록 좋음)
        if val is None:
            return 0
        if val <= 50:
            return 30
        elif val <= 75:
            return 20
        elif val <= 100:
            return 10
        else:
            return 0

    def score_crnt_rate(val):  # 유동비율 (높을수록 좋음)
        if val is None:
            return 0
        if val >= 150:
            return 30
        elif val >= 100:
            return 20
        elif val >= 70:
            return 10
        else:
            return 0

    def score_quck_rate(val):  # 당좌비율 (높을수록 좋음)
        if val is None:
            return 0
        if val >= 100:
            return 30
        elif val >= 70:
            return 20
        elif val >= 50:
            return 10
        else:
            return 0

    # 값 파싱
    lblt_rate = safe_float(data.get("lblt_rate"))
    bram_depn = safe_float(data.get("bram_depn"))
    crnt_rate = safe_float(data.get("crnt_rate"))
    quck_rate = safe_float(data.get("quck_rate"))

    # 개별 점수 계산
    score1 = score_lblt_rate(lblt_rate)
    score2 = score_bram_depn(bram_depn)
    score3 = score_crnt_rate(crnt_rate)
    score4 = score_quck_rate(quck_rate)

    total_score = (score1 + score2 + score3 + score4) * (100/120) # 전체 점수 비율 100점으로 환산

    risk_level = (
        "안정" if total_score >= 90 else "보통" if total_score >= 60 else "위험"
    )

    return {
        "score_by_metric": [
            {"label": "부채비율", "value": lblt_rate, "score": score1},
            {"label": "고정비율", "value": bram_depn, "score": score2},
            {"label": "유동비율", "value": crnt_rate, "score": score3},
            {"label": "당좌비율", "value": quck_rate, "score": score4},
        ],
        "total_score": total_score,
        "risk_level": risk_level,
    }


def get_financial_ratios(symbol: str) -> dict:
    token = get_access_token()

    url = f"{os.getenv('BASE_URL')}/uapi/domestic-stock/v1/finance/stability-ratio"
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
        "tr_id": "FHKST66430600",
        "custtype": "P",
    }

    res = requests.get(url, headers=headers, params=params)
    res_json = res.json()

    if res_json.get("rt_cd") != "0":
        raise Exception(f"API 오류: {res_json}")

    output = res_json.get("output", [])
    latest = output[0] if output else {}

    score_result = score_financial_stability(latest)

    return {
        "symbol": symbol,
        "report_date": latest.get("stac_yymm"),
        "stability_score": round(score_result["total_score"], 2),
        "raw_data": {
            "lblt_rate": latest.get("lblt_rate"),
            "bram_depn": latest.get("bram_depn"),
            "crnt_rate": latest.get("crnt_rate"),
            "quck_rate": latest.get("quck_rate"),
        },
        "score_details": score_result["score_by_metric"],
        "risk_level": score_result["risk_level"],
    }
