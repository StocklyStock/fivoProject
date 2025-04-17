import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getRecommendedStocks } from "../slices/recommendRandom5Slice";
import { fetchStockSummary, fetchVolatility, fetchSupplyRisk, fetchFinancial, fetchProfitability } from "../services/stockapi";
import StockSummaryCard from "../components/StockSummaryCard";
import RiskScoreSelector from "../components/RiskScoreSelector";

const AIRecommPage = () => {
  const dispatch = useDispatch();
  const { stocks, loading, error } = useSelector((state) => state.recommend5);

  const [summaries, setSummaries] = useState({});
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("TOP5");

  const [volatility, setVolatility] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [stability, setStability] = useState(null);
  const [supplyRisk, setSupplyRisk] = useState(null);

  useEffect(() => {
    dispatch(getRecommendedStocks());
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
    let interval;

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
    interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [selectedStock?.stock_code]);

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
        <h2 style={{ marginTop: "40px" }}>
          {selectedStock?.company_name} ({selectedStock?.stock_code})
        </h2>
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

        {/* ✅ 디버깅 코드
        {console.log("🧪 selectedStock:", selectedStock)}
        {console.log("🧪 positive_news:", selectedStock?.positive_news)} */}

        {/* ✅ 조건부 렌더링 테스트 */}
        {selectedStock?.positive_news?.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h3>📈 상승 확률 높은 뉴스 TOP 3</h3>
            <ul style={{ paddingLeft: "16px", fontSize: "14px" }}>
              {[...selectedStock.positive_news]
                .sort((a, b) => b.prob - a.prob)
                .slice(0, 3)
                .map((news, idx) => (
                  <li key={idx} style={{ marginBottom: "12px" }}>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontWeight: "bold",
                        color: "#1976d2",
                        textDecoration: "none",
                      }}
                    >
                      {news.title}
                    </a>
                    <div
                      style={{
                        color: "#555",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {news.summary}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      상승 확률: {(news.prob * 100).toFixed(2)}%
                    </div>
                  </li>
                ))}
            </ul>
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