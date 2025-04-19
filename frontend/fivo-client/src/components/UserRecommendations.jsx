import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStockSummary,
  fetchVolatility,
  fetchProfitability,
  fetchFinancial,
  fetchSupplyRisk,
} from "../services/stockapi";
import { addFavorite, removeFavorite } from "../slices/favoriteSlice";
import { getUserRecommendedStocks } from "../slices/recommendUserSlice";
import StockSummaryCard from "./StockSummaryCard";
import RiskScoreSelector from "./RiskScoreSelector";
import { useNavigate } from "react-router-dom";

const UserRecommendations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userStocks, loading, error } = useSelector((state) => state.userRecommendedStocks);
  const favorites = useSelector((state) => state.favorites.items);
  const isAuthenticated = useSelector((state) => state.auth.user !== null);
  const investmentStyle = useSelector((state) => state.auth.user?.investment_style); // ✅ 사용자 성향 가져오기

  const [summaries, setSummaries] = useState({});
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [volatility, setVolatility] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [stability, setStability] = useState(null);
  const [supplyRisk, setSupplyRisk] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);

  const filteredStocks = userStocks
    .filter((stock) => stock.predicted_label === 3)
    .slice(0, 5);

  useEffect(() => {
    dispatch(getUserRecommendedStocks());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllSummaries = async () => {
      const results = {};
      for (const stock of filteredStocks) {
        try {
          const summary = await fetchStockSummary(stock.stock_code);
          results[stock.stock_code] = summary;
        } catch (e) {
          console.error("요약 정보 실패:", stock.stock_code);
        }
      }
      setSummaries(results);
      if (filteredStocks.length > 0 && !selectedStock) {
        setSelectedStock(filteredStocks[0]);
      }
    };
    if (filteredStocks.length > 0) fetchAllSummaries();
  }, [userStocks]);

  useEffect(() => {
    const fetchAll = async () => {
      if (selectedStock?.stock_code) {
        try {
          const summary = await fetchStockSummary(selectedStock.stock_code);
          setSelectedSummary(summary);
          const [v, p, f, s] = await Promise.all([
            fetchVolatility(selectedStock.stock_code),
            fetchProfitability(selectedStock.stock_code),
            fetchFinancial(selectedStock.stock_code),
            fetchSupplyRisk(selectedStock.stock_code),
          ]);
          setVolatility(v);
          setProfitability(p);
          setStability(f);
          setSupplyRisk(s);
        } catch (err) {
          console.error("리스크 정보 로딩 실패:", err);
        }
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [selectedStock?.stock_code]);

  const isFavorite = selectedStock && favorites.some((fav) => fav.stock_code === selectedStock.stock_code);
  const favoriteId = selectedStock && favorites.find((fav) => fav.stock_code === selectedStock.stock_code)?.id;

  const toggleFavorite = () => {
    if (!selectedStock) return;
    if (isFavorite) {
      dispatch(removeFavorite(favoriteId));
    } else {
      dispatch(addFavorite({
        stock_code: selectedStock.stock_code,
        stock_name: selectedStock.company_name,
      }));
    }
  };

  const goToDetailPage = () => {
    if (!selectedStock) return;
    navigate(`/stock/${selectedStock.stock_code}`);
  };

  return (
    <>
      <h1 style={{ marginTop: 20 }}>
        👤 사용자 맞춤 추천 종목
        {investmentStyle && (
          <span style={{ fontSize: "16px", marginLeft: 10, color: "#888" }}>
            ({investmentStyle} 투자자)
          </span>
        )}
      </h1>
      {loading && <p>불러오는 중...</p>}
      {error && <p>에러: {error}</p>}

      <div className="recommend-cards-container">
        {filteredStocks.map((stock) => {
          const summary = summaries[stock.stock_code];
          const isSelected = selectedStock?.stock_code === stock.stock_code;
          const isUp = summary?.change > 0;
          const changeColor = isUp ? "red" : "blue";
          const symbol = isUp ? "▲" : "▼";

          return (
            <div
              key={stock.stock_code}
              onClick={() => setSelectedStock(stock)}
              className={`recommend-card ${isSelected ? "selected" : ""}`}
            >
              <div className="card-header">
                <strong>{stock.company_name}</strong>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  ({stock.stock_code})
                </div>
              </div>

              {summary ? (
                <>
                  <div className="price">{Number(summary.price).toLocaleString()}원</div>
                  <div className="change-rate" style={{ color: changeColor }}>
                    {symbol}
                    {Math.abs(summary.change).toLocaleString()} (
                    {Math.abs(summary.change_rate).toFixed(2)}%)
                  </div>
                </>
              ) : (
                <div className="price">로딩 중...</div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSummary && (
        <>
          <h1 style={{ marginTop: "40px", display: "flex", alignItems: "center", gap: 12 }}>
            {selectedStock?.company_name} ({selectedStock?.stock_code})
            {isAuthenticated && (
              <>
                <button onClick={toggleFavorite} style={{ marginLeft: '10px' }}>
                  {isFavorite ? '⭐' : '☆'}
                </button>
                <button className="detail-button" onClick={goToDetailPage}>
                  🔍 종목 상세
                </button>
              </>
            )}
          </h1>

          <StockSummaryCard data={selectedSummary} />

          {volatility && profitability && stability && supplyRisk && (
            <RiskScoreSelector
              companyName={selectedStock?.company_name}
              scores={{
                volatility: volatility.volatility_score,
                profitability: profitability.profitability_score,
                stability: stability.stability_score,
                supplyRisk: supplyRisk.risk_score,
              }}
            />
          )}

          {selectedStock?.positive_news?.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <h1 style={{ marginBottom: 16, fontSize: 22, fontWeight: 700 }}>
                📈 상승 확률 높은 뉴스 TOP 3
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[...selectedStock.positive_news]
                  .sort((a, b) => b.prob - a.prob)
                  .slice(0, 3)
                  .map((news, idx) => {
                    const isHighProb = news.prob >= 0.98;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedUrl(news.url)}
                        className={`news-card ${isHighProb ? "high-prob" : ""}`}
                      >
                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 6 }}>
                          {news.title.length > 40 ? `${news.title.slice(0, 40)}...` : news.title}
                        </div>
                        <div style={{ color: '#555', fontSize: '13px', marginBottom: 6 }}>
                          {news.summary.length > 50 ? `${news.summary.slice(0, 50)}...` : news.summary}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: isHighProb ? '#ff3d00' : '#1976d2' }}>
                          상승 확률: {(news.prob * 100).toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
              </div>
              {selectedUrl && (
                <div className="news-modal-overlay" onClick={() => setSelectedUrl(null)}>
                  <div className="news-modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="news-modal-header">
                      <button onClick={() => setSelectedUrl(null)}>✖️ 닫기</button>
                    </div>
                    <iframe
                      src={selectedUrl}
                      title="뉴스 상세"
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserRecommendations;
