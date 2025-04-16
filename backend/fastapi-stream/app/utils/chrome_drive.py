from fake_useragent import UserAgent
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from user_agent import generate_user_agent


def driver():
    # 사용자 에이전트를 직접 생성
    userAgent = (
        generate_user_agent()
    )  # generate_user_agent()가 올바르게 사용자 에이전트를 생성한다고 가정
    print(
        f"사용자 에이전트: {userAgent}"
    )  # 생성된 사용자 에이전트를 출력하여 확인할 수 있음

    # 옵션 설정
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("disable-infobars")
    chrome_options.page_load_strategy = "normal"
    chrome_options.add_argument("--enable-automation")
    chrome_options.add_argument("disable-infobars")
    chrome_options.add_argument("disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument(f"user-agent={userAgent}")  # 올바른 user-agent 설정
    chrome_options.add_argument("--lang=ko_KR")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--allow-insecure-localhost")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-browser-side-navigation")
    chrome_options.add_argument("--mute-audio")
    chrome_options.add_argument("--headless")  # 헤드리스 모드로 실행

    # 브라우저 열기
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=chrome_options
    )
    driver.implicitly_wait(3)
    return driver


if __name__ == "__main__":
    # 드라이버 객체 생성
    driver_instance = driver()
