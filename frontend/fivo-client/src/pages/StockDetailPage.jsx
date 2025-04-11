import React, { useState, useEffect } from 'react';
import { fetchStockSummary } from '../services/stockapi';  // API 호출 함수

const StockDetailPage = ({ stockId }) => {
  const [stockData, setStockData] = useState(null);  // 종목 데이터 상태
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [error, setError] = useState(null);  // 오류 상태

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchStockSummary(stockId);  // stockId에 해당하는 종목 데이터 호출
        console.log(data);  // API 응답 확인을 위한 로그
        setStockData(data);  // 받아온 데이터를 상태에 저장
      } catch (err) {
        setError('종목 상세 정보를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (stockId) {
      fetchDetails(); // stockId가 있을 때 API 호출
    }
  }, [stockId]);

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

  return (
    <div>
      {/* 데이터가 제대로 로드되면 종목 데이터 표시 */}
      {stockData && (
        <div>
          <h2>{stockData.symbol} 차트</h2>
          <p>현재가: {stockData.price}</p>
          <p>등락률: {stockData.change_rate}%</p>
          {/* 여기에 추가적인 종목 정보를 표시할 수 있습니다. */}
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
