import json
import os

file_path = os.path.join(os.path.dirname(__file__), "../data/stock_list.json")

with open(file_path, encoding="utf-8") as f:
    stock_list = json.load(f)


def find_symbol(query: str) -> str | None:
    query = query.strip()
    for item in stock_list:
        if item["회사명"] == query or item["종목코드"] == query:
            return item["종목코드"]
    return None
