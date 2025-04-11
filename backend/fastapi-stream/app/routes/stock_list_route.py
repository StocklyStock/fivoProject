# backend/routes/stock_list_route.py

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json
import os

router = APIRouter()


@router.get("/stocks")
def get_stock_list():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "stock_list.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)
