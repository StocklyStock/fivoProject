// src/pages/AIRecommPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecommendedStocks } from "../slices/recommendRandom5Slice";
import { fetchFavorites } from "../slices/favoriteSlice";
import Top5Recommendations from "../components/Top5Recommendations";
import UserRecommendations from "../components/UserRecommendations";
import LoginRequiredModal from "../components/LoginRequiredModal"; // ✅ 추가
import "../index.css";

const AIRecommPage = () => {
  const dispatch = useDispatch();
  const { stocks, loading, error } = useSelector((state) => state.recommend5);
  const user = useSelector((state) => state.auth.user); // ✅ 유저 정보
  const [selectedMenu, setSelectedMenu] = useState("TOP5");
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ 모달 상태

  useEffect(() => {
    dispatch(getRecommendedStocks());
    dispatch(fetchFavorites());
  }, [dispatch]);

  // ✅ 사용자맞춤 클릭 시 로그인 여부 확인
  const handleTabClick = (menu) => {
    if (menu === "사용자맞춤추천" && !user) {
      setShowLoginModal(true);
    } else {
      setSelectedMenu(menu);
    }
  };

  return (
    <section className="ai-recomm-wrap relative">
      <div className="tab-menus">
        {["TOP5", "사용자맞춤추천"].map((menu) => (
          <span
            key={menu}
            className={`tab-risk ${selectedMenu === menu ? "btn-color" : ""}`}
            onClick={() => handleTabClick(menu)}
          >
            {menu}
          </span>
        ))}
      </div>

      {selectedMenu === "TOP5" && (
        <Top5Recommendations stocks={stocks} loading={loading} error={error} />
      )}

      {selectedMenu === "사용자맞춤추천" && user && <UserRecommendations />}

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
    </section>
  );
};

export default AIRecommPage;
