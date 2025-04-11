from fastapi import Request
from fastapi import FastAPI, Body
from dotenv import load_dotenv
import os
import requests
from .utils import send_discord_notification, get_friendly_name

# -------------------------------
# ✅ 환경 분기 처리
# -------------------------------
env_mode = os.getenv("ENV", "development")
env_file = f".env.{env_mode}"
load_dotenv(dotenv_path=env_file)

# -------------------------------
# ✅ 환경 변수 불러오기
# -------------------------------
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_OWNER = os.getenv("REPO_OWNER")
REPO_NAME = os.getenv("REPO_NAME")

app = FastAPI()

# -------------------------------
# ✅ 테스트용 Webhook 시뮬레이터
# -------------------------------
@app.get("/test-webhook/{event_type}")
def test_webhook(event_type: str):
    mock_payload = {
        "sender": {"login": "eunbi-kang"},  # 테스트: 은비
        "repository": {"full_name": "StocklyStock/fivo_project"},
        "action": "opened",  # ✅ 누락 방지!
        "issue": {
            "title": "Test Issue",
            "html_url": "https://github.com/StocklyStock/fivo_project/issues/1"
        },
        "pull_request": {
            "title": "Test Pull Request",
            "html_url": "https://github.com/StocklyStock/fivo_project/pull/1"
        },
        "head_commit": {
            "message": "This is a test commit!"
        },
        "workflow_run": {
            "name": "CI/CD - Test Workflow",
            "conclusion": "success",
            "html_url": "https://github.com/StocklyStock/fivo_project/actions"
        },
        "deployment": {
            "environment": "development"
        },
        "deployment_status": {
            "state": "success",
            "description": "Deployed successfully!"
        }
    }

    send_discord_notification(event_type, mock_payload)
    return {"message": f"✅ '{event_type}' 테스트 알림 전송 완료! 잘했어요, 은비님! 🎉"}


# -------------------------------
# ✅ GitHub 이슈 생성 API
# -------------------------------
@app.post("/create-issue/")
def create_github_issue(title: str = Body(...), body: str = Body(...)):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }
    payload = {
        "title": title,
        "body": body,
        "labels": ["from-web"]
    }

    res = requests.post(url, json=payload, headers=headers)

    if res.status_code == 201:
        issue_url = res.json().get("html_url")
        payload_for_discord = {
            "action": "opened",  # ✅ 꼭 넣기!
            "sender": {"login": "eunbi-kang"},
            "repository": {"full_name": f"{REPO_OWNER}/{REPO_NAME}"},
            "issue": {
                "title": title,
                "html_url": issue_url
            }
        }
        send_discord_notification("issues", payload_for_discord)
        return {
            "message": "이슈 생성 성공! 🎉 정말 잘했어, 은비님! 계속 이렇게 멋지게 해보자구요! 🙌",
            "url": issue_url,
            "repo": f"https://github.com/{REPO_OWNER}/{REPO_NAME}"
        }
    else:
        return {
            "message": "이슈 생성 실패... 😢 다시 시도해보자, 은비님! 다음엔 꼭 성공할 거예요! 💪",
            "detail": res.json()
        }

# -------------------------------
# ✅ GitHub Webhook 수신 엔드포인트
# -------------------------------
@app.post("/github-webhook/")
async def github_webhook(request: Request):
    event_type = request.headers.get("X-GitHub-Event", "unknown")
    payload = await request.json()

    print(f"📥 [Webhook 수신] 이벤트 타입: {event_type}")
    send_discord_notification(event_type, payload)

    return {"message": f"✅ {event_type} 알림 전송 완료!"}