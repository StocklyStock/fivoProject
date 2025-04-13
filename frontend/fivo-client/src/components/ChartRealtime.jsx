import React, { useState, useEffect } from "react";
import Treemap from "./Treemap";

const ChartRealtime = ({ onThemeChange, onNewsFetched, onStocksFetched }) => {
  const [data, setData] = useState({ name: "테마주", children: [] });
  const [selectedThemeCode, setSelectedThemeCode] = useState(null);
  const [selectedThemeName, setSelectedThemeName] = useState(""); // ✅ 테마 이름 저장
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    // 처음에 실패 대비용으로 저장된 데이터 불러오기
    const savedData = localStorage.getItem("lastTreemapData");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  
    let socket;
    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8000/ws/theme");
  
      socket.onopen = () => console.log("✅ WebSocket 연결됨");
  
      socket.onmessage = (event) => {
        const received = JSON.parse(event.data);
        const converted = {
          ...received,
          children: received.children.map((c) => ({
            ...c,
            value: parseFloat(c.value),
            theme_code: c.code,
          })),
        };
  
        setData(converted);
        localStorage.setItem("lastTreemapData", JSON.stringify(converted));
      };
  
      socket.onerror = (err) => {
        console.error("❌ WebSocket 오류", err);
      };
  
      socket.onclose = () => {
        console.warn("📴 WebSocket 연결 종료, 3초 후 재연결 시도");
        setTimeout(connectWebSocket, 3000);
      };
    };
  
    connectWebSocket();
    return () => socket && socket.close();
  }, []);

  const handleThemeClick = async (themeCode) => {
    try {
      // console.log("🚀 handleThemeClick 진입:", themeCode);
  
      const matched = data.children.find((item) => item.theme_code === themeCode);
      // console.log("🔍 matched 데이터:", matched);
  
      // ✅ 부모(HomePage)에게 선택 테마 전달
      onThemeChange?.(themeCode, matched?.name ?? "");
  
      const newsRes = await fetch(`http://localhost:8000/theme/news?theme_code=${themeCode}`);
      // console.log("📡 응답 상태 코드:", newsRes.status);
  
      const newsJson = await newsRes.json();
      // console.log("📰 받은 뉴스 데이터:", newsJson);
  
      // ✅ 부모(HomePage)에게 뉴스 데이터 전달
      onNewsFetched?.(newsJson);

      // 관련 종목 fetch 요청 (추가!)
      const stocksRes = await fetch(`http://localhost:8000/theme/stock_list?theme_code=${themeCode}`);
      const stocksJson = await stocksRes.json();
      // console.log("📰 받은 종목 데이터:", stocksJson);
      onStocksFetched?.(stocksJson); // 부모에게 종목 데이터 전달하는 콜백 추가 필요!
    } catch (e) {
      console.error("❌ 뉴스 요청 중 예외 발생:", e);
      onNewsFetched?.([]); // 실패 시 빈 배열 전달 (뉴스)
      onStocksFetched?.([]); // 실패 시 빈 배열 전달 (종목)
    }
  };
  

  return (
    <div
      className="realtime-wrapper"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h2 className="text-xl font-bold mb-4">📈 실시간 테마주 트리맵</h2>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <Treemap data={data} onThemeClick={handleThemeClick} />
      </div>
    </div>
  );
};

export default ChartRealtime;