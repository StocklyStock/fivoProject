// stockapi.js

import axios from "axios";

// ✅ 종목 검색 함수
export const fetchStockSearch = async (query) => {
  const res = await fetch(`http://localhost:8000/stocks`);
  if (!res.ok) throw new Error("📉 종목 검색 실패");
  const all = await res.json();

  // 필터링된 종목 리스트 반환
  return all.filter(
    (item) => item.회사명.includes(query) || item.종목코드.includes(query)
  );
};

// ✅ 종목 요약 정보 API 호출 함수
export const fetchStockSummary = async (symbol) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/stock/summary?query=${symbol}`
    );
    return response.data; // API 응답 데이터 반환
  } catch (error) {
    console.error("종목 요약 정보 가져오기 실패:", error);
    throw error;
  }
};

// ✅ 캔들 차트 데이터 API 호출 함수
export const fetchCandles = async (symbol, timeframe) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/chart/${timeframe}?query=${symbol}`
    );
    return response.data; // API 응답 데이터 반환
  } catch (error) {
    console.error("캔들 차트 데이터를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

// ============================
// 여기서부터 타입 추가
// ============================

// StockCandle 타입 (캔들 차트 데이터를 위한 타입 정의)
export const StockCandle = {
  time: "string", // 시각
  open: "number", // 시가
  high: "number", // 고가
  low: "number", // 저가
  close: "number", // 종가
  volume: "number", // 거래량
};

// SymbolInfo 타입 (종목 정보에 필요한 타입 정의)
export const SymbolInfo = {
  회사명: "string", // 회사명
  종목코드: "string", // 종목코드
  시장구분: "string", // 시장 구분 (예: KOSPI, KOSDAQ)
};
