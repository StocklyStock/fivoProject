import os
from accounts.models import CustomUser
from favorites.models import FavoriteStock
import json
from collections import Counter

def get_all_user_stock_codes(user):
    # from favorites.models import FavoriteStock
    favorite_codes = list(
        FavoriteStock.objects.filter(user=user).values_list('stock_code', flat=True)
    )

    stock_json_path = os.path.join("chatbot", "mymodel", "data", "stock_list.json")
    with open(stock_json_path, "r", encoding="utf-8") as f:
        stock_data = json.load(f)
        name_to_code = {item["회사명"]: item["종목코드"] for item in stock_data}

    holding_names = user.owned_stocks
    holding_codes = []
    for name in holding_names:
        if name in name_to_code:
            holding_codes.append(name_to_code[name])
        else:
            print(f"⚠️ 종목 이름 '{name}'이 stock_list.json에 없음")

    return list(set(favorite_codes + holding_codes))

def get_top2_sectors(user):
    # 1. 종목 코드 리스트 가져오기
    stock_codes = get_all_user_stock_codes(user)

    # 2. 산업군 매핑 파일 로드
    sector_json_path = os.path.join("dummy", "stock_list_with_sector.json")
    with open(sector_json_path, "r", encoding="utf-8") as f:
        sector_data = json.load(f)
        code_to_sector = {item["종목코드"]: item["업종"] for item in sector_data}

    # 3. 종목 코드 → 산업군 리스트
    sector_list = []
    for code in stock_codes:
        if code in code_to_sector:
            sector_list.append(code_to_sector[code])
        else:
            print(f"⚠️ 종목코드 '{code}'는 산업군 정보가 없습니다.")

    # 4. 카운트 → Top 2 추출
    top2 = Counter(sector_list).most_common(2)
    return top2  # 예: [("기타 금융업", 3), ("전자부품 제조업", 2)]

def get_sector_stocks_for_prediction(user):
    # Top2 산업군 추출
    top2_sectors = get_top2_sectors(user)
    top_sector_names = [s[0] for s in top2_sectors]

    # JSON 파일 열기
    sector_json_path = os.path.join("dummy", "stock_list_with_sector.json")
    with open(sector_json_path, "r", encoding="utf-8") as f:
        sector_data = json.load(f)

    # Top2 산업군 + KOSPI/KOSDAQ 필터링
    filtered = [
        item for item in sector_data
        if item["업종"] in top_sector_names and item["시장구분"] in ["KOSPI", "KOSDAQ"]
    ]

    # 시장구분별 나누기
    kospi_stocks = [item for item in filtered if item["시장구분"] == "KOSPI"]
    kosdaq_stocks = [item for item in filtered if item["시장구분"] == "KOSDAQ"]

    # 더 많은 시장 구분 선택
    selected_market = "KOSPI" if len(kospi_stocks) >= len(kosdaq_stocks) else "KOSDAQ"

    # 최종 선정 종목
    selected = [item for item in filtered if item["시장구분"] == selected_market]
    return [item["종목코드"] for item in selected]

# if __name__ == "__main__":
    # PYTHONPATH=. python userRecommend/services/stock_code_collector.py
    # import django
    # os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    # django.setup()

    # from accounts.models import CustomUser
    
    # user = CustomUser.objects.get(id=113)
    # codes = get_sector_stocks_for_prediction(user)
    # print("🎯 최종 예측 대상 종목:", len(codes))
    # # codes = get_all_user_stock_codes(user)
    # # print("✅ 종목 코드 리스트:", codes)

    # # top2 = get_top2_sectors(user)
    # # print("🔥 Top2 산업군:", top2)