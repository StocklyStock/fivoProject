from .kis_api import fetch_candles

# fetch_candles + get_chart_data
def format_chart_output(raw_data: list):
    return [
        {
            "time": item["stck_bsop_date"],
            "open": float(item["stck_oprc"]),
            "high": float(item["stck_hgpr"]),
            "low": float(item["stck_lwpr"]),
            "close": float(item["stck_clpr"]),
            "volume": int(item["acml_vol"]),
        }
        for item in reversed(raw_data)
    ]


def get_chart_data(symbol: str, timeframe: str):
    output = fetch_candles(symbol, timeframe)
    if not output:
        return []

    # 일봉일 경우 최근 3개월치만 자르기 (약 65 거래일)
    if timeframe == "daily":
        output = output[-65:]

    return format_chart_output(output)
