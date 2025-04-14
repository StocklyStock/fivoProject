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

// ============================
// 변동성 점수 API 관련 추가
// ============================

// VolatilityMetric 타입 (변동성 리스크 구성 지표)
export const VolatilityMetric = {
  label: "string", // 지표명 (예: 등락률, 거래량변동률)
  value: "number", // 지표 값
};

// VolatilityResponse 타입 (변동성 점수 응답)
export const VolatilityResponse = {
  symbol: "string", // 종목 코드
  volatility_score: "number", // 변동성 점수
  raw_data: {
    prdy_ctrt: "string", // 전일 등락률
    prdy_vrss_vol_rate: "string", // 거래량 변동률
    w52_hgpr_vrss_prpr_ctrt: "string", // 52주 최고가 대비 현재가 변동률
    vol_tnrt: "string", // 거래량 회전율
  },
  score_details: [VolatilityMetric], // 변동성 점수 세부 지표 목록
};

// 변동성 점수 조회 함수
export const fetchVolatility = async (query) => {
  try {
    const res = await fetch(
      `http://localhost:8000/stock/volatility?query=${query}`
    );
    if (!res.ok) throw new Error("변동성 점수 조회 실패");
    return res.json(); // 변동성 점수 데이터를 반환
  } catch (error) {
    console.error("변동성 점수 데이터를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

// ============================
// 수급 리스크 API 관련 추가
// ============================

// SupplyMetric 타입 (수급 리스크 지표)
export const SupplyMetric = {
  label: "string", // 지표명 (예: 외국인 지분율, 외국인 순매수)
  value: "number", // 지표 값
  score: "number", // 점수
  max: "number", // 최대값
};

// SupplyRiskResponse 타입 (수급 리스크 응답)
export const SupplyRiskResponse = {
  symbol: "string", // 종목 코드
  risk_score: "number", // 수급 리스크 점수
  risk_level: "string", // 리스크 수준 (예: 위험, 보통, 좋음)
  score_details: [SupplyMetric], // 수급 리스크 세부 지표 목록
};

// 수급 리스크 점수 조회 함수
export const fetchSupplyRisk = async (query) => {
  try {
    const res = await axios.get(
      `http://localhost:8000/stock/supply-risk?query=${query}`
    );
    return res.data; // 수급 리스크 데이터를 반환
  } catch (error) {
    console.error("수급 리스크 데이터를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

// ============================
// 수익성 리스크 API 관련 추가
// ============================

// ProfitabilityMetric 타입 (수익성 리스크 구성 지표)
export const ProfitabilityMetric = {
  label: "string", // 지표명 (예: ROE, Operating Margin)
  value: "number", // 지표 값
  score: "number", // 점수
};

// ProfitabilityResponse 타입 (수익성 리스크 응답)
export const ProfitabilityResponse = {
  symbol: "string", // 종목 코드
  profitability_score: "number", // 수익성 점수
  raw_data: {
    roe: "number", // ROE
    roa: "number", // ROA
    operating_margin: "number", // Operating Margin
    net_margin: "number", // Net Margin
  },
  score_details: [ProfitabilityMetric], // 수익성 점수 세부 지표 목록
};

// 수익성 점수 조회 함수
export const fetchProfitability = async (query) => {
  try {
    const res = await fetch(
      `http://localhost:8000/stock/profitability?query=${query}`
    );
    if (!res.ok) throw new Error("수익성 점수 조회 실패");
    return res.json(); // 수익성 점수 데이터를 반환
  } catch (error) {
    console.error("수익성 점수 데이터를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

// ============================
// 재무 안정성 리스크 API 관련 추가
// ============================

// FinancialMetric 타입 (재무 안정성 리스크 구성 지표)
export const FinancialMetric = {
  label: "string", // 지표명 (예: 부채비율, 고정비율)
  value: "number", // 지표 값
  score: "number", // 점수
  max: "number", // 최대값
};

// FinancialResponse 타입 (재무 안정성 리스크 응답)
export const FinancialResponse = {
  symbol: "string", // 종목 코드
  stability_score: "number", // 재무 안정성 점수
  raw_data: {
    lblt_rate: "number", // 부채비율
    bram_depn: "number", // 고정비율
    crnt_rate: "number", // 유동비율
    quck_rate: "number", // 당좌비율
  },
  score_details: [FinancialMetric], // 재무 안정성 점수 세부 지표 목록
};

// 재무 안정성 점수 조회 함수
export const fetchFinancial = async (query) => {
  try {
    const res = await fetch(
      `http://localhost:8000/stock/financial?query=${query}`
    );
    if (!res.ok) throw new Error("재무 안정성 점수 조회 실패");
    return res.json(); // 재무 안정성 점수 데이터를 반환
  } catch (error) {
    console.error("재무 안정성 점수 데이터를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};
