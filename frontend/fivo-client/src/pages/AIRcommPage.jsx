// src/pages/AIRecommPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getRecommendedStocks } from "../slices/recommendRandom5Slice";
import { fetchFavorites } from "../slices/favoriteSlice";
import Top5Recommendations from "../components/Top5Recommendations";
import UserRecommendations from "../components/UserRecommendations"; // ✅ 추가
import "../index.css";

const AIRecommPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stocks, loading, error } = useSelector((state) => state.recommend5);
  const [selectedMenu, setSelectedMenu] = useState("TOP5");

  useEffect(() => {
    dispatch(getRecommendedStocks());
    dispatch(fetchFavorites());
  }, [dispatch]);

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
        <Top5Recommendations stocks={stocks} loading={loading} error={error} />
      )}

      {selectedMenu === "사용자맞춤추천" && (
        <UserRecommendations /> // ✅ 사용자 추천 컴포넌트 추가
      )}
    </section>
  );
};

export default AIRecommPage;
