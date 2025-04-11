import requests, os
from datetime import datetime

# 디스코드 웹훅 & 아이콘
DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")
GITHUB_ICON = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"

# ✅ 팀원 깃허브 아이디 → 이름 매핑
TEAM_MEMBERS = {
    "eunbi-kang": "은비",
    "dlsrnjs125": "인권",
    "hongduck710": "홍덕",
    "JeongJaeyun99": "재윤"
}

def get_friendly_name(github_id: str) -> str:
    return TEAM_MEMBERS.get(github_id, github_id)

# ✅ 디스코드 알림 전송 함수
def send_discord_notification(event_type: str, payload: dict):
    github_id = payload.get("sender", {}).get("login", "알 수 없음")
    username = get_friendly_name(github_id)
    repo = payload.get("repository", {}).get("full_name", "unknown/repo")

    embed = {
        "title": "",
        "description": "",
        "color": 0x5865F2,
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {"text": f"📁 Repo: {repo}"}
    }

    # 🎯 Push 이벤트
    if event_type == "push":
        commit = payload.get("head_commit", {})
        embed["title"] = "🧾 Push 발생"
        embed["description"] = f"**{username}** 님이 커밋했어요!\n```{commit.get('message', '')}```\n코드 향기 솔솔~ ☕"

    # 🎯 Pull Request
    elif event_type == "pull_request":
        pr = payload.get("pull_request", {})
        action = payload.get("action", "opened")
        embed["title"] = "📌 Pull Request"
        embed["description"] = f"**{username}** 님이 PR을 `{action}` 했어요!\n👉 [{pr.get('title')}]({pr.get('html_url')})\n리뷰 한 번 봐주세요 👀"

    # 🎯 이슈 알림
    elif event_type == "issues":
        issue = payload.get("issue", {})
        action = payload.get("action", "opened")
        embed["title"] = "🗂️ 이슈 알림"
        embed["description"] = f"**{username}** 님이 이슈를 `{action}` 했어요!\n👉 [{issue.get('title')}]({issue.get('html_url')})\n아이디어일까? 버그일까? 🤔"

    # 🎯 워크플로우 실행
    elif event_type == "workflow_run":
        workflow = payload.get("workflow_run", {})
        name = workflow.get("name", "")
        status = workflow.get("conclusion", "unknown")
        emoji = "🎉" if status == "success" else "💥"
        msg = (
            f"{emoji} **{username}** 님, 워크플로우 `{name}` 성공했어요! 고생했어요 👏"
            if status == "success"
            else f"{emoji} **{username}** 님, `{name}` 실패했어요... 다시 도전! 💪"
        )
        embed["title"] = "⚙️ CI/CD 실행 결과"
        embed["description"] = f"{msg}\n🔗 [워크플로우 보기]({workflow.get('html_url')})"

    # 🎯 배포 상태
    elif event_type == "deployment_status":
        status = payload.get("deployment_status", {})
        environment = payload.get("deployment", {}).get("environment", "unknown")
        state = status.get("state", "unknown")
        desc = status.get("description", "")
        emoji = "🚀" if state == "success" else "⚠️"
        msg = (
            f"{emoji} **{username}** 님이 `{environment}` 환경에 배포 성공했어요! 축하해요! 🎊"
            if state == "success"
            else f"{emoji} `{environment}` 환경 배포가 실패했어요... 다음엔 꼭 성공할 거예요! 🙏"
        )
        embed["title"] = "🚀 배포 상태"
        embed["description"] = f"{msg}\n💬 {desc}"

    # 🎯 기타 이벤트
    else:
        embed["title"] = f"📡 {event_type} 이벤트"
        embed["description"] = f"이벤트 타입 `{event_type}` 은 아직 지원하지 않아요 😢"

    # 💬 디스코드 전송
    data = {
        "username": "📢 Fivo 알림 봇",
        "avatar_url": GITHUB_ICON,
        "embeds": [embed]
    }

    try:
        res = requests.post(DISCORD_WEBHOOK, json=data)
        res.raise_for_status()
    except Exception as e:
        print("❌ Discord 알림 실패:", e)
