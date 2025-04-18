import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getRecommendedStocks } from "../slices/recommendRandom5Slice";
import {
  fetchStockSummary,
  fetchVolatility,
  fetchSupplyRisk,
  fetchFinancial,
  fetchProfitability,
} from "../services/stockapi";
import StockSummaryCard from "../components/StockSummaryCard";
import RiskScoreSelector from "../components/RiskScoreSelector";
import { addFavorite, removeFavorite, fetchFavorites } from "../slices/favoriteSlice";

const AIRecommPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stocks, loading, error } = useSelector((state) => state.recommend5);
  const favorites = useSelector((state) => state.favorites.items);
  const isAuthenticated = useSelector((state) => state.auth.user !== null);

  const [summaries, setSummaries] = useState({});
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("TOP5");
  const [volatility, setVolatility] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [stability, setStability] = useState(null);
  const [supplyRisk, setSupplyRisk] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);

  useEffect(() => {
    dispatch(getRecommendedStocks());
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllSummaries = async () => {
      const results = {};
      for (const stock of stocks) {
        try {
          const summary = await fetchStockSummary(stock.stock_code);
          results[stock.stock_code] = summary;
        } catch (e) {
          console.error("요약 정보 실패:", stock.stock_code);
        }
      }
      setSummaries(results);
      if (stocks.length > 0 && !selectedStock) {
        setSelectedStock(stocks[0]);
      }
    };

    if (stocks.length > 0) {
      fetchAllSummaries();
    }
  }, [stocks]);

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
          console.error("요약, 리스크 정보 로딩 실패:", err);
        }
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [selectedStock?.stock_code]);

  const isFavorite =
    selectedStock && favorites.some((fav) => fav.stock_code === selectedStock.stock_code);
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
    <section className="ai-recomm-wrap">
      <div className="tab-menus" style={{ marginBottom: 20 }}>
        {["TOP5", "사용자맞춤추천", "커스터마이징추천", "보유종목리포트"].map((menu) => (
          <span
            key={menu}
            className={`tab-risk ${selectedMenu === menu ? "btn-color" : ""}`}
            onClick={() => setSelectedMenu(menu)}
            style={{
              marginRight: 12,
              padding: "8px 16px",
              borderRadius: 8,
              background: selectedMenu === menu ? "#f05a28" : "#fff",
              color: selectedMenu === menu ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: 500,
              border: "1px solid #ddd",
            }}
          >
            {menu}
          </span>
        ))}
      </div>

      {selectedMenu === "TOP5" && (
        <>
          <h1 style={{ marginTop: 20 }}>🔥 AI 추천 종목</h1>
          {loading && <p>불러오는 중...</p>}
          {error && <p>에러: {error}</p>}

          <div
            className="recommend-cards-container"
            style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
          >
            {stocks.map((stock) => {
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
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    minWidth: "200px",
                    border: isSelected ? "2px solid #1976d2" : "1px solid #ccc",
                  }}
                >
                  <div className="card-header" style={{ marginBottom: "8px" }}>
                    <strong>{stock.company_name}</strong>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      ({stock.stock_code})
                    </div>
                  </div>
                  {summary ? (
                    <>
                      <div
                        className="price"
                        style={{ fontSize: "22px", fontWeight: "bold" }}
                      >
                        {Number(summary.price).toLocaleString()}원
                      </div>
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
                    <button
                      onClick={goToDetailPage}
                      style={{
                        background: "#e0e0e0",
                        color: "#333",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 500,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        transition: "background 0.2s, transform 0.2s",
                        marginLeft: "auto",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#d5d5d5";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#e0e0e0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
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
                            style={{
                              background: '#fff',
                              padding: '16px',
                              borderRadius: 10,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                              cursor: 'pointer',
                              flex: '1 1 250px',
                              border: isHighProb ? '2px solid #ff5252' : '1px solid #ccc',
                            }}
                          >
                            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 6 }}>
                              {news.title.length > 40 ? `${news.title.slice(0, 40)}...` : news.title}
                            </div>
                            <div style={{ color: '#555', fontSize: '13px', marginBottom: 6 }}>
                              {news.summary.length > 50 ? `${news.summary.slice(0, 50)}...` : news.summary}
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: isHighProb ? '#ff3d00' : '#1976d2',
                              }}
                            >
                              상승 확률: {(news.prob * 100).toFixed(2)}%
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {selectedUrl && (
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                      }}
                      onClick={() => setSelectedUrl(null)}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "90%",
                          height: "80%",
                          background: "#fff",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "right",
                            padding: "0.5rem 1rem",
                            borderBottom: "1px solid #eee",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
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
      )}
    </section>
  );
};

export default AIRecommPage;