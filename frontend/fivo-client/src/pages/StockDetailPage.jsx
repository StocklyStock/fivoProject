import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // useParams 훅 임포트
import { fetchStockSummary, fetchCandles, fetchVolatility, fetchSupplyRisk, fetchFinancial, fetchProfitability } from '../services/stockapi';  // API 호출 함수
import StockSummaryCard from '../components/StockSummaryCard';  // StockSummaryCard 컴포넌트 임포트
import D3CandlestickChart from '../components/StockChart';  // D3CandlestickChart 컴포넌트 임포트
import VolatilityRiskOverview from '../components/VolatilityRiskOverview'; // 변동성 리스크 분석 컴포넌트
import VolatilityGauge from '../components/VolatilityGauge';  // 변동성 점수 컴포넌트
import SupplyRiskOverview from '../components/SupplyRiskOverview';  // 외국인 수급 리스크 분석 컴포넌트
import SupplyRiskGauge from '../components/SupplyRiskGauge';  // 외국인 수급 리스크 점수 컴포넌트
import StabilityRiskOverview from '../components/StabilityRiskOverview'; // 안정성 리스크 분석 컴포넌트
import StabilityGauge from '../components/StabilityGauge'; // 안정성 점수 컴포넌트
import ProfitabilityOverview from '../components/ProfitabilityOverview'; // 수익성 리스크 분석 컴포넌트
import ProfitabilityGauge from '../components/ProfitabilityGauge'; // 수익성 리스크 점수 컴포넌트

const StockDetailPage = () => {
  const { stockId } = useParams();  // URL에서 stockId 가져오기
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [error, setError] = useState(null);  // 오류 상태
  const [symbol, setSymbol] = useState(stockId); // symbol 상태 (종목코드)
  const [summary, setSummary] = useState(null);  // 종목 요약 정보
  const [candles, setCandles] = useState([]);  // 캔들 데이터
  const [volatility, setVolatility] = useState(null); // 변동성 리스크 데이터
  const [supplyRisk, setSupplyRisk] = useState(null); // 외국인 수급 리스크 데이터
  const [financialData, setFinancialData] = useState(null); // 재무 안정성 리스크 데이터
  const [profitabilityData, setProfitabilityData] = useState(null); // 수익성 리스크 데이터
  const [timeframe, setTimeframe] = useState('daily');  // 차트 단위 (일, 주, 월)
  const [stocksList, setStocksList] = useState([]); // 전체 종목 리스트
  const [selectedMenu, setSelectedMenu] = useState('시세분석'); // 선택된 메뉴 상태 (시세분석, 리스크분석)
  const [riskAnalysisMenu, setRiskAnalysisMenu] = useState('변동성 리스크 분석'); // 리스크 분석 메뉴 상태

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

  // 종목 요약, 캔들 데이터, 변동성 리스크, 외국인 수급 리스크, 재무 안정성, 수익성 데이터를 가져오기
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

    const fetchVolatilityData = async () => {
      try {
        const volatilityData = await fetchVolatility(stockId);  // 변동성 데이터 가져오기
        setVolatility(volatilityData);  // 변동성 리스크 데이터를 상태에 저장
      } catch (err) {
        console.error('변동성 데이터 가져오는데 실패했습니다.', err);
      }
    };

    const fetchSupplyRiskData = async () => {
      try {
        const supplyRiskData = await fetchSupplyRisk(stockId);  // 외국인 수급 리스크 데이터 가져오기
        setSupplyRisk(supplyRiskData);  // 외국인 수급 리스크 데이터를 상태에 저장
      } catch (err) {
        console.error('외국인 수급 리스크 데이터 가져오는데 실패했습니다.', err);
      }
    };

    const fetchFinancialData = async () => {
      try {
        const financialData = await fetchFinancial(stockId);  // 재무 안정성 리스크 데이터 가져오기
        setFinancialData(financialData);  // 재무 안정성 데이터를 상태에 저장
      } catch (err) {
        console.error('재무 안정성 데이터 가져오는데 실패했습니다.', err);
      }
    };

    const fetchProfitabilityData = async () => {
      try {
        const profitabilityData = await fetchProfitability(stockId);  // 수익성 리스크 데이터 가져오기
        setProfitabilityData(profitabilityData);  // 수익성 리스크 데이터를 상태에 저장
      } catch (err) {
        console.error('수익성 리스크 데이터 가져오는데 실패했습니다.', err);
      }
    };

    if (stockId) {
      fetchDetails();  // stockId가 있을 때 API 호출
      fetchCandlesData();  // 캔들 데이터 호출
      fetchVolatilityData(); // 변동성 리스크 데이터 호출
      fetchSupplyRiskData(); // 외국인 수급 리스크 데이터 호출
      fetchFinancialData(); // 재무 안정성 데이터 호출
      fetchProfitabilityData(); // 수익성 리스크 데이터 호출
    }

    const interval = setInterval(() => {
      fetchDetails();  // 3초마다 종목 요약 데이터 갱신
      fetchCandlesData();  // 3초마다 캔들 데이터 갱신
      fetchVolatilityData(); // 3초마다 변동성 리스크 갱신
      fetchSupplyRiskData(); // 3초마다 외국인 수급 리스크 갱신
      fetchFinancialData(); // 3초마다 재무 안정성 데이터 갱신
      fetchProfitabilityData(); // 3초마다 수익성 리스크 데이터 갱신
    }, 30000);

    return () => clearInterval(interval);  // 컴포넌트 언마운트 시 타이머 클리어
  }, [stockId, timeframe]);  // stockId와 timeframe이 변경될 때마다 다시 호출

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
      {/* 상단 메뉴바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span
            onClick={() => setSelectedMenu('시세분석')}
            style={{ cursor: 'pointer', color: selectedMenu === '시세분석' ? 'blue' : 'black' }}
          >
            시세분석
          </span>
          <span
            onClick={() => setSelectedMenu('리스크분석')}
            style={{ cursor: 'pointer', color: selectedMenu === '리스크분석' ? 'blue' : 'black' }}
          >
            리스크분석
          </span>
        </div>
      </div>
      
      {/* 종목 제목 */}
      <h1
        style={{
          fontSize: '36px',  // 글씨 크기를 크게
          fontWeight: 'bold', // 볼드 처리
          marginBottom: '20px', // 아래쪽 여백 추가
        }}
      >
        {displayTitle}
      </h1>
      
      {/* 메뉴에 따라 화면 내용 변경 */}
      {selectedMenu === '시세분석' && (
        <div>
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
      )}

      {selectedMenu === '리스크분석' && (
        <div>
          {/* 리스크 분석 메뉴바 */}
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <span
              onClick={() => setRiskAnalysisMenu('변동성 리스크 분석')}
              style={{
                cursor: 'pointer',
                color: riskAnalysisMenu === '변동성 리스크 분석' ? 'blue' : 'black',
                marginRight: '20px',
              }}
            >
              변동성 리스크 분석
            </span>
            <span
              onClick={() => setRiskAnalysisMenu('외국인 수급 리스크 분석')}
              style={{
                cursor: 'pointer',
                color: riskAnalysisMenu === '외국인 수급 리스크 분석' ? 'blue' : 'black',
                marginRight: '20px',
              }}
            >
              외국인 수급 리스크 분석
            </span>
            <span
              onClick={() => setRiskAnalysisMenu('안정성 리스크 분석')}
              style={{
                cursor: 'pointer',
                color: riskAnalysisMenu === '안정성 리스크 분석' ? 'blue' : 'black',
                marginRight: '20px',
              }}
            >
              안정성 리스크 분석
            </span>
            <span
              onClick={() => setRiskAnalysisMenu('수익성 리스크 분석')}
              style={{
                cursor: 'pointer',
                color: riskAnalysisMenu === '수익성 리스크 분석' ? 'blue' : 'black',
              }}
            >
              수익성 리스크 분석
            </span>
          </div>

          {/* 리스크 분석 메뉴에 따른 화면 내용 */}
          {riskAnalysisMenu === '변동성 리스크 분석' && volatility && (
            <div>
              {/* 주식 요약 카드 */}
              <StockSummaryCard data={summary} /> {/* StockSummaryCard에 데이터 전달 */}

              {/* 변동성 리스크 구성 지표 */}
              <VolatilityRiskOverview data={volatility.score_details} />
              
              {/* 변동성 점수 */}
              <VolatilityGauge score={volatility.volatility_score} />
            </div>
          )}

          {riskAnalysisMenu === '외국인 수급 리스크 분석' && supplyRisk && (
            <div>
              {/* 주식 요약 카드 */}
              <StockSummaryCard data={summary} /> {/* StockSummaryCard에 데이터 전달 */}

              {/* 외국인 수급 리스크 구성 지표 */}
              <SupplyRiskOverview data={supplyRisk.score_details} />
              
              {/* 외국인 수급 리스크 점수 */}
              <SupplyRiskGauge score={supplyRisk.risk_score} />
            </div>
          )}

          {riskAnalysisMenu === '안정성 리스크 분석' && financialData && (
            <div>
              {/* 주식 요약 카드 */}
              <StockSummaryCard data={summary} /> {/* StockSummaryCard에 데이터 전달 */}

              {/* 재무 안정성 리스크 구성 지표 */}
              <StabilityRiskOverview data={financialData.score_details} />
              
              {/* 재무 안정성 점수 */}
              <StabilityGauge score={financialData.stability_score} />
            </div>
          )}

          {riskAnalysisMenu === '수익성 리스크 분석' && profitabilityData && (
            <div>
              {/* 주식 요약 카드 */}
              <StockSummaryCard data={summary} /> {/* StockSummaryCard에 데이터 전달 */}

              {/* 수익성 리스크 구성 지표 */}
              <ProfitabilityOverview data={profitabilityData} />
              
              {/* 수익성 리스크 점수 */}
              <ProfitabilityGauge score={profitabilityData.profitability_score} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
