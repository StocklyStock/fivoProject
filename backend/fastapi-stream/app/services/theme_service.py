import time, re
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from app.utils.chrome_drive import driver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def calculate_date(days_ago: int) -> str:
    today = datetime.today()
    return (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")

def fetch_theme_data():
    browser = driver()
    try:
        url = "https://finance.finup.co.kr/Lab/ThemeLog"
        browser.get(url)
        WebDriverWait(browser, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "contents01"))
        )
        soup = BeautifulSoup(browser.page_source, "html.parser")
        theme_divs = soup.select("div.contents01 div.box_desc.on div#treemap > div")

        theme_rows = []
        for item in theme_divs:
            keyword = item.find("div", class_="nodeKeyword")
            diff = item.find("div", class_="nodeDiff")
            code = item.get("id", "")[1:] if item.has_attr("id") else None
            if keyword and diff and code:
                try:
                    diff_value = float(diff.text.strip().replace("%", ""))
                except ValueError:
                    diff_value = 0.0
                theme_rows.append(
                    {
                        "theme_name": keyword.text.strip(),
                        "theme_diff": diff.text.strip(),
                        "theme_code": code,
                        "theme_diff_value": diff_value,
                    }
                )
        return pd.DataFrame(theme_rows)
    finally:
        browser.quit()

# 내부 메모리 캐시
_cached_theme_data = {}
_CACHE_TTL = 600  # 초 단위 (10분)

def fetch_theme_all_cached(theme_code: str):
    now = time.time()

    # ✅ 캐시 HIT + 유효 시간 내
    if theme_code in _cached_theme_data:
        cached_time, news_df, stock_df = _cached_theme_data[theme_code]
        if now - cached_time < _CACHE_TTL:
            print(f"📦 [캐시 HIT] theme_code: {theme_code}")
            return news_df, stock_df
        else:
            print(f"🗑️ [캐시 만료] theme_code: {theme_code}")
            del _cached_theme_data[theme_code]

    # ✅ 캐시 MISS → 크롤링
    print(f"🌐 [크롤링 요청] theme_code: {theme_code}")
    news_df, stock_df = fetch_theme_all(theme_code)
    _cached_theme_data[theme_code] = (now, news_df, stock_df)
    return news_df, stock_df

def fetch_theme_all(theme_code: str):
    browser = driver()
    try:
        url = f"https://finance.finup.co.kr/Theme/{theme_code}"
        browser.get(url)
        time.sleep(1)
        soup = BeautifulSoup(browser.page_source, "html.parser")

        # ✅ 뉴스 추출
        news_list = soup.select("ul#ulNewsList > li")
        news_data = []
        for news in news_list:
            box_txt = news.select_one("div.box_txt")
            if not box_txt:
                continue
            date_text = box_txt.select_one("p.cm_color_lg.cm_smtxt").text.strip()
            title = box_txt.select_one("p.mt5.cm_txt").text.strip()
            summary = box_txt.select_one("p.mt5.cm_smtxt.cm_color_lg").text.strip()
            onclick_attr = news.get("onclick", "")
            url_match = re.search(r"popupNewsOpen\('(.*?)'\)", onclick_attr)
            url = url_match.group(1) if url_match else None
            try:
                days_ago = int(re.search(r"\d+", date_text).group())
                news_date = calculate_date(days_ago)
            except:
                news_date = "알 수 없음"
            news_data.append({
                "theme_code": theme_code,
                "news_date": news_date,
                "title": title,
                "summary": summary,
                "url": url,
            })

        # ✅ 종목 추출
        stocks = []
        table = soup.find('table', id='tRelationStock')
        if table:
            rows = table.find_all('tr')
            for row in rows:
                columns = row.find_all('td')
                if columns:
                    stock_name = columns[0].get_text(strip=True)
                    stock_link = row.get('onclick').replace("javascript:location.href='", "").replace("'", "")
                    match = re.search(r"/Stock/(\d{6})", stock_link)
                    if match:
                        code = match.group(1)
                        full_link = f"http://localhost:5173/stock/{code}"
                        stocks.append({'name': stock_name, 'link': full_link})

        return pd.DataFrame(news_data), pd.DataFrame(stocks)
    finally:
        browser.quit()