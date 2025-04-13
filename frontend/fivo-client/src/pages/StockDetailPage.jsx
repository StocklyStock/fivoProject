import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // useParams 훅 임포트
import { fetchStockSummary } from '../services/stockapi';  // API 호출 함수
import StockSummaryCard from '../components/StockSummaryCard';  // StockSummaryCard 컴포넌트 임포트

const StockDetailPage = () => {
  const { stockId } = useParams();  // URL에서 stockId 가져오기
  const [stockData, setStockData] = useState(null);  // 종목 데이터 상태
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [error, setError] = useState(null);  // 오류 상태
  const [symbol, setSymbol] = useState(stockId); // symbol 상태 (종목코드)
  const [summary, setSummary] = useState(null);  // 종목 요약 정보
  const [stocksList, setStocksList] = useState([]); // 전체 종목 리스트

  useEffect(() => {
    // 종목 리스트를 가져오는 함수
    const fetchStockList = async () => {
      try {
        const response = await fetch('http://localhost:8000/stocks');
        const data = await response.json();
        setStocksList(data); // 전체 종목 리스트 저장
      } catch (err) {
        console.error("종목 리스트를 불러오는데 실패했습니다.", err);
      }
    };

    fetchStockList();
  }, []); // 처음 한번만 실행

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchStockSummary(stockId);  // stockId에 해당하는 종목 데이터 호출
        setStockData(data);  // 받아온 데이터를 상태에 저장
        setSummary(data);  // 종목 요약 정보를 상태에 저장
      } catch (err) {
        setError('종목 상세 정보를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (stockId) {
      fetchDetails();  // stockId가 있을 때 API 호출
    }

    const interval = setInterval(fetchDetails, 3000);  // 3초마다 데이터 갱신

    return () => clearInterval(interval);  // 컴포넌트 언마운트 시 타이머 클리어
  }, [stockId]);  // stockId가 변경될 때마다 다시 호출

  // 로딩 중일 때
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  // 오류가 있을 때
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error}</p>
      </div>
    );
  }

  // 종목 리스트에서 stockId에 해당하는 회사명과 종목코드 찾기
  const selectedStock = stocksList.find((stock) => stock.종목코드 === stockId);
  
  // displayTitle을 종목의 회사명과 종목코드로 구성
  const displayTitle = selectedStock
    ? `${selectedStock.회사명} (${selectedStock.종목코드})`
    : "주식 데이터 로딩 중";

  return (
    <div style={{ padding: '20px' }}>
      <h2>{displayTitle} 차트</h2> {/* 회사명과 종목코드 함께 표시 */}
      
      {/* 주식 요약 카드 */}
      <StockSummaryCard data={summary} /> {/* StockSummaryCard에 데이터 전달 */}

      {/* 여기에 차트, 변동성, 수익성 등 다른 컴포넌트 추가 */}
      {/* 예시로 D3CandlestickChart 등을 추가할 수 있습니다 */}
    </div>
  );
};

export default StockDetailPage;
