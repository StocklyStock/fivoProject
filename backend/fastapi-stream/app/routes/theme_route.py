import json, asyncio
from fastapi import APIRouter, WebSocket, HTTPException
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocketState
from datetime import datetime
from app.services.theme_service import fetch_theme_data, fetch_theme_all_cached

router = APIRouter()
LAST_TREEMAP_DATA = {}


from starlette.websockets import WebSocketState

@router.websocket("/ws/theme")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket 연결됨")

    try:
        while True:
            now = datetime.now()
            if 9 <= now.hour < 18:
                df = fetch_theme_data()
                data = {
                    "name": "테마주",
                    "children": [
                        {
                            "name": row["theme_name"],
                            "value": (
                                float(
                                    row["theme_diff"]
                                    .replace("%", "")
                                    .replace("+", "")
                                    .strip()
                                )
                                if row["theme_diff"]
                                .replace("%", "")
                                .replace("+", "")
                                .replace(".", "", 1)
                                .replace("-", "")
                                .isdigit()
                                else 0
                            ),
                            "code": row["theme_code"],
                        }
                        for _, row in df.iterrows()
                    ],
                }
                LAST_TREEMAP_DATA.update(data)

                if websocket.application_state == WebSocketState.CONNECTED:
                    await websocket.send_text(json.dumps(data, ensure_ascii=False))

            else:
                if websocket.application_state == WebSocketState.CONNECTED:
                    await websocket.send_text(json.dumps(LAST_TREEMAP_DATA, ensure_ascii=False))

            await asyncio.sleep(60)

    except Exception as e:
        print(f"❌ WebSocket 오류: {e}")

    finally:
        if websocket.application_state == WebSocketState.CONNECTED:
            await websocket.close()
        print("📴 WebSocket 연결 종료")

@router.get("/theme/data")
def get_theme_data(theme_code: str):
    try:
        news_df, stock_df = fetch_theme_all_cached(theme_code)
        return {
            "news": news_df.to_dict(orient="records"),
            "stocks": stock_df.to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"크롤링 오류: {e}")