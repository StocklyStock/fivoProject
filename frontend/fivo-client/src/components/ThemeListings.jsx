import React, { useState, useEffect } from 'react';
import { fetchStockSummary } from '../services/stockapi';  // 이미 정의된 API 함수 (주식 요약 정보)

const ThemeListings = ({ stock_list = [], themeName }) => {
  const [stockDetails, setStockDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const extractStockCode = (link) => {
    const match = link.match(/(\d{6})$/);  // link 끝에 있는 6자리 숫자 (종목 코드)
    return match ? match[1] : null;
  };

  // 최대 10개의 종목만 받아오도록 하는 함수
  const getLimitedStockList = () => {
    const totalStocks = stock_list.length;

    // 데이터가 10개 이상이면, 가장 앞의 5개와 가장 뒤의 5개만 받아옵니다.
    if (totalStocks > 10) {
      return [
        ...stock_list.slice(0, 5),   // 가장 앞의 5개
        ...stock_list.slice(-5)       // 가장 뒤의 5개
      ];
    }

    // 데이터가 10개 미만이면 전부 받아옵니다.
    return stock_list;
  };

  // 종목 정보를 순차적으로 호출하도록 구현 (딜레이 제거)
  const getStockDetailsSequentially = async () => {
    setLoading(true);
    const limitedStockList = getLimitedStockList();  // 최대 10개의 종목 리스트 가져오기
    for (let i = 0; i < limitedStockList.length; i++) {
      const stock = limitedStockList[i];
      const stockCode = extractStockCode(stock.link);  // 종목 코드 추출
      if (stockCode) {
        try {
          const summary = await fetchStockSummary(stockCode); // 주식 요약 정보를 받아옴
          setStockDetails(prevDetails => ({
            ...prevDetails,
            [stockCode]: summary,  // 종목 코드별로 데이터를 저장
          }));
        } catch (error) {
          console.error(`주식 정보를 가져오는 데 실패했습니다: ${stockCode}`, error);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    getStockDetailsSequentially();
  }, [stock_list]);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
      <div className="headline-wrap">
        <h2><span>{themeName} 관련 종목</span></h2>
      </div>
      <div className="list-wrap">
        {loading ? (
          <div>Loading...</div>
        ):(
          <ul>
            {getLimitedStockList().map((stock, index) => {
              const stockCode = extractStockCode(stock.link);  // 종목 코드 추출
              return (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={stock.link} rel="noopener noreferrer" style={{ flex: 1 }}>
                    {stock.name}
                  </a>
                  {/* 가격과 등락률을 추가 */}
                  {stockCode && stockDetails[stockCode] && (
                    <div style={{ display: 'inline-block', textAlign: 'right', flex: 1 }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {stockDetails[stockCode].price.toLocaleString()}
                      </span>
                      <span 
                        style={{
                          color: stockDetails[stockCode].change > 0 ? 'red' : 'blue', 
                          fontSize: '14px', 
                          marginLeft: '8px'
                        }}
                      >
                        {stockDetails[stockCode].change > 0 ? '▲' : '▼'} 
                        {Math.abs(stockDetails[stockCode].change).toLocaleString()} ({Math.abs(stockDetails[stockCode].change_rate).toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

      </div>
    </div>
  );
}

export default ThemeListings;