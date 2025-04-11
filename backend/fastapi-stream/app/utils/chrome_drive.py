import os
import platform
import undetected_chromedriver as uc
from fake_useragent import UserAgent
import warnings

warnings.filterwarnings("ignore") 


def driver():
    ua = UserAgent()
    user_agent = ua.random

    options = uc.ChromeOptions()
    options.add_argument("--headless=new")  # 최신 크롬용 headless
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-notifications")
    options.add_argument("--lang=ko_KR")
    options.add_argument(f"user-agent={user_agent}")

    # ✨ 브라우저 경로 자동 분기
    system = platform.system()
    chrome_path = None

    if system == "Darwin":
        chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    elif system == "Windows":
        chrome_path = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    elif system == "Linux":
        # 도커에선 일반적으로 이 경로로 설치됨
        chrome_path = "/usr/bin/google-chrome"

    if not os.path.exists(chrome_path):
        raise RuntimeError(
            f"❌ Chrome 실행 파일을 찾을 수 없습니다: {chrome_path}\n"
            f"👉 로컬이면 크롬이 설치돼 있는지 확인하고, 필요 시 직접 경로를 수정하세요."
        )

    driver = uc.Chrome(
        options=options,
        browser_executable_path=chrome_path,
        use_subprocess=True,
    )
    driver.implicitly_wait(3)
    return driver
