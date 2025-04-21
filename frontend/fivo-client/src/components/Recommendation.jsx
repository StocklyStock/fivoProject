import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecommendedStocks } from "../slices/recommendRandom5Slice";
import { fetchStockSummary } from "../services/stockapi";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChartLine } from "@fortawesome/free-solid-svg-icons";

const Recommendation = () => {
  const dispatch = useDispatch();
  const { stocks, loading, error } = useSelector((state) => state.recommend5);

  const [stock, setStock] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // 1. 추천 종목 가져오기
  useEffect(() => {
    if (stocks.length === 0) {
      dispatch(getRecommendedStocks());
    } else {
      setStock(stocks[0]);
    }
  }, [dispatch, stocks]);

  // 2. 종목 요약 정보를 5초마다 갱신
  useEffect(() => {
    let intervalId;

    const fetchSummary = async () => {
      if (stock?.stock_code) {
        setIsLoadingSummary(true);
        try {
          const result = await fetchStockSummary(stock.stock_code);
          setSummary(result);
        } catch (err) {
          console.error("요약 정보 로딩 실패:", err);
        } finally {
          setIsLoadingSummary(false);
        }
      }
    };

    fetchSummary(); // 최초 1회 실행

    if (stock?.stock_code) {
      intervalId = setInterval(fetchSummary, 2000); // 5초마다 반복
    }

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 clear
  }, [stock]);

  // 3. 가격 및 등락률 관련 계산
  const price = summary?.price ?? null;
  const change = summary?.change ?? null;
  const changeRate = summary?.change_rate ?? null;

  const isUp = change > 0;
  const rateColor = isUp ? "red" : "blue";
  const symbol = isUp ? "▲" : "▼";

  return (
    <section className="recommendation">
      <div className="card-wrapper">
        <div className="card-inner">
          <div className="card-front current-recomm">
            <div>
              <h1>
                추천 종목 <FontAwesomeIcon icon={faChartLine} />
              </h1>

              {loading && <p>불러오는 중...</p>}
              {error && <p>에러: {error}</p>}

              {!loading && stock && (
                <>
                  <h2>
                    <strong>{stock.company_name}</strong>
                    <span className="stock-code">({stock.stock_code})</span>
                  </h2>

                  <h3>
                    <strong>
                      {price ? Number(price).toLocaleString() : "가격 정보 없음"}
                    </strong>
                    <span
                      className="rate-of-change"
                      style={{ marginLeft: "8px", color: rateColor }}
                    >
                      {price ? (
                        <>
                          {symbol}
                          {Math.abs(change).toLocaleString()} (
                          {Math.abs(changeRate).toFixed(2)}%)
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </h3>
                </>
              )}
            </div>

            <div className="stock-description">
              AI 추천 종목 중 하나입니다.
            </div>
          </div>

          <div className="card-back go-to-ai">
            <p>
              AI 알고리즘이 매일 아침 5종목을 추천합니다.
              <br />
              종목 탐색의 용도로 활용할 수 있습니다.
            </p>
            <Link to="/airecomm">
              서비스 자세히 보기 <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recommendation;
