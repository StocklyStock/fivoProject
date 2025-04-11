// stockapi.js

import axios from "axios";

// 종목 검색 함수
export const fetchStockSearch = async (query) => {
  const res = await fetch(`http://localhost:8003/stocks`);
  if (!res.ok) throw new Error("📉 종목 검색 실패");
  const all = await res.json();
  return all.filter(
    (item) => item.회사명.includes(query) || item.종목코드.includes(query)
  );
};

// 다른 API 호출 함수들
export const fetchStockSummary = async (symbol) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/stock/summary?query=${symbol}`
    );
    return response.data;
  } catch (error) {
    console.error("종목 요약 정보 가져오기 실패:", error);
    throw error;
  }
};
