import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // useParams 훅 임포트
import { fetchStockSummary, fetchCandles } from '../services/stockapi';  // API 호출 함수
import StockSummaryCard from '../components/StockSummaryCard';  // StockSummaryCard 컴포넌트 임포트
import D3CandlestickChart from '../components/StockChart';  // D3CandlestickChart 컴포넌트 임포트

const StockDetailPage = () => {
  const { stockId } = useParams();  // URL에서 stockId 가져오기
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [error, setError] = useState(null);  // 오류 상태
  const [symbol, setSymbol] = useState(stockId); // symbol 상태 (종목코드)
  const [summary, setSummary] = useState(null);  // 종목 요약 정보
  const [candles, setCandles] = useState([]);  // 캔들 데이터
  const [timeframe, setTimeframe] = useState('daily');  // 차트 단위 (일, 주, 월)
  const [stocksList, setStocksList] = useState([]); // 전체 종목 리스트

  // 종목 리스트를 가져오는 함수
  useEffect(() => {
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

  // 종목 요약과 캔들 데이터 가져오기
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchStockSummary(stockId);  // stockId에 해당하는 종목 데이터 호출
        setSummary(data);  // 종목 요약 정보를 상태에 저장
      } catch (err) {
        setError('종목 상세 정보를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCandlesData = async () => {
      try {
        const candlesData = await fetchCandles(stockId, timeframe);  // timeframe에 맞는 캔들 데이터 가져오기
        setCandles(candlesData);  // 캔들 데이터를 상태에 저장
      } catch (err) {
        console.error('캔들 데이터 가져오는데 실패했습니다.', err);
      }
    };

    if (stockId) {
      fetchDetails();  // stockId가 있을 때 API 호출
      fetchCandlesData();  // 캔들 데이터 호출
    }

    const interval = setInterval(() => {
      fetchDetails();
      fetchCandlesData();  // 3초마다 데이터 갱신
    }, 3000);

    return () => clearInterval(interval);  // 컴포넌트 언마운트 시 타이머 클리어
  }, [stockId, timeframe]);  // stockId와 timeframe이 변경될 때마다 다시 호출

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
      {/* h1로 변경하여 더 큰 글씨와 볼드 처리 */}
      <h2
        style={{
          fontSize: '36px',  // 글씨 크기를 크게
          fontWeight: 'bold', // 볼드 처리
          marginBottom: '20px', // 아래쪽 여백 추가
        }}
      >
        {displayTitle} 차트
      </h2> {/* 회사명과 종목코드 함께 표시 */}
      
      {/* 주식 요약 카드 */}
      <StockSummaryCard data={summary} /> {/* StockSummaryCard에 데이터 전달 */}

      {/* 차트 단위 선택 버튼 */}
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginLeft: 20 }}>
        <span style={{ fontWeight: 500 }}>단위:</span>
        {['daily', 'weekly', 'monthly'].map((unit) => {
          const label = unit === 'daily' ? '일' : unit === 'weekly' ? '주' : '월';
          const isActive = timeframe === unit;

          return (
            <button
              key={unit}
              onClick={() => setTimeframe(unit)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: isActive ? '2px solid #1976d2' : '1px solid #ccc',
                background: isActive ? '#e3f2fd' : '#fff',
                color: isActive ? '#1976d2' : '#333',
                fontWeight: 500,
                cursor: 'pointer',
                minWidth: 40,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* D3CandlestickChart 컴포넌트 추가 - 실시간 캔들 차트 */}
      <D3CandlestickChart key={timeframe} data={candles} symbol={symbol} timeframe={timeframe} />
    </div>
  );
};

export default StockDetailPage;
