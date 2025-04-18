import requests

FASTAPI_PREDICT_URL = "http://localhost:8000/predict/by-sector"  # 실제 배포 시 외부 주소로 변경

def send_stock_codes_to_fastapi(code_list):
    """
    종목코드 리스트를 FastAPI에 POST 전송
    Args:
        code_list (List[str]): 종목코드 문자열 리스트
    Returns:
        dict or None: FastAPI 응답 결과
    """
    try:
        payload = {"codes": code_list}
        print(f"🚀 FastAPI에 전송할 종목코드 수: {len(code_list)}")
        response = requests.post(FASTAPI_PREDICT_URL, json=payload)
        response.raise_for_status()
        print("✅ FastAPI 응답 수신 완료")
        return response.json()
    except requests.RequestException as e:
        print("❌ FastAPI 전송 실패:", e)
        return None