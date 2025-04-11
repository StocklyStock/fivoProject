import os
import requests
from dotenv import load_dotenv
from ..core.token_manager import get_access_token  

load_dotenv()


def score_volatility(data: dict) -> dict:
    def score_change_rate(value):
        value = abs(float(value))
        if value >= 7:
            return 30
        elif value >= 5:
            return 25
        elif value >= 3:
            return 15
        elif value >= 1:
            return 5
        else:
            return 0

    def score_volume_change(value):
        value = float(value)
        if value >= 500:
            return 30
        elif value >= 300:
            return 25
        elif value >= 100:
            return 15
        elif value >= 50:
            return 5
        else:
            return 0

    def score_disparity(value):
        value = abs(float(value))
        if value >= 40:
            return 20
        elif value >= 30:
            return 15
        elif value >= 20:
            return 10
        elif value >= 10:
            return 5
        else:
            return 0

    def score_turnover(value):
        value = float(value)
        if value >= 20:
            return 20
        elif value >= 10:
            return 15
        elif value >= 5:
            return 10
        elif value >= 1:
            return 5
        else:
            return 0

    # 개별 점수 계산
    score1 = score_change_rate(data.get("prdy_ctrt", 0))
    score2 = score_volume_change(data.get("prdy_vrss_vol_rate", 0))
    score3 = score_disparity(data.get("w52_hgpr_vrss_prpr_ctrt", 0))
    score4 = score_turnover(data.get("vol_tnrt", 0))

    total_score = score1 + score2 + score3 + score4

    return {
        "score_by_metric": [
            {"label": "등락률", "value": float(data.get("prdy_ctrt", 0))},
            {
                "label": "거래량변동률",
                "value": float(data.get("prdy_vrss_vol_rate", 0)),
            },
            {"label": "괴리율", "value": float(data.get("w52_hgpr_vrss_prpr_ctrt", 0))},
            {"label": "회전율", "value": float(data.get("vol_tnrt", 0))},
        ],
        "total_score": total_score,
        "risk_level": (
            "높음" if total_score >= 70 else "보통" if total_score >= 40 else "낮음"
        ),
    }


def get_volatility(symbol: str) -> dict:
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

    res = requests.get(url, headers=headers, params=params)
    res_json = res.json()

    if res_json.get("rt_cd") != "0":
        raise Exception(f"API 오류: {res_json}")

    output = res_json.get("output", {})
    score_result = score_volatility(output)

    return {
        "symbol": symbol,
        "volatility_score": round(score_result["total_score"], 2),
        "raw_data": {
            "prdy_ctrt": output.get("prdy_ctrt"),
            "prdy_vrss_vol_rate": output.get("prdy_vrss_vol_rate"),
            "w52_hgpr_vrss_prpr_ctrt": output.get("w52_hgpr_vrss_prpr_ctrt"),
            "vol_tnrt": output.get("vol_tnrt"),
        },
        "score_details": score_result["score_by_metric"],
        "risk_level": score_result["risk_level"],
    }
