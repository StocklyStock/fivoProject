import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options  # ✅ 추가
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time
import os

def latest_news(stock_name):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(BASE_DIR, "data", "stock_list.json")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        stock_data = json.load(f)

    stock_code = None
    for item in stock_data:
        if item["회사명"] == stock_name:
            stock_code = item["종목코드"]
            break

    if not stock_code:
        print(f"❌ 종목명 '{stock_name}'을 찾을 수 없습니다.")
        return []

    url = f'https://finance.daum.net/quotes/A{stock_code}#news/stock'

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")  # ❗ 크래시 방지
    options.add_argument("--disable-dev-shm-usage")  # ❗ shared memory 문제 방지
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("window-size=1920x1080")
    options.add_argument("user-agent=Mozilla/5.0")

    driver = webdriver.Chrome(options=options)
    driver.get(url)

    # 'tableB' 클래스가 로딩될 때까지 기다림 (최대 10초)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "tableB"))
        )
    except:
        print("뉴스 요소 로딩 실패")
        driver.quit()
        return

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    news_list = soup.find("div", class_="tableB").find_all("li")

    news_data = []

    for news in news_list:
        title_tag = news.find("a", class_="tit")
        summary_tag = news.find("a", class_="txt")

        if title_tag and summary_tag:
            news_data.append(title_tag.get_text(strip=True) + " " + summary_tag.get_text(strip=True))

    driver.quit()
    return news_data

if __name__ == "__main__":
    # 종목이름을 불러와서 종목 코드를 불러온뒤 latest_news에 넣는다
    news = latest_news("삼성전자")
    for n in news:
        print("📰", n)
    print(len(news))