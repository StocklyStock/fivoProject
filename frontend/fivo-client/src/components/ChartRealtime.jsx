import React, { useState, useEffect } from "react";
import Treemap from "./Treemap";
import NewsListings from "./NewsListings";

const ChartRealtime = () => {
  const [data, setData] = useState({ name: "테마주", children: [] });
  const [selectedThemeCode, setSelectedThemeCode] = useState(null);
  const [selectedThemeName, setSelectedThemeName] = useState(""); // ✅ 테마 이름 저장
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
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
          })),
        };
        setData(converted);
      };
      socket.onerror = (err) => console.error("❌ WebSocket 오류", err);
      socket.onclose = () => setTimeout(connectWebSocket, 3000);
    };

    connectWebSocket();
    return () => socket && socket.close();
  }, []);

  const handleThemeClick = async (themeCode) => {
    const matched = data.children.find((item) => item.theme_code === themeCode);
    setSelectedThemeCode(themeCode);
    setSelectedThemeName(matched?.name ?? ""); // ✅ 테마명 저장

    try {
      const res = await fetch(`http://fastapi:8001/theme/news?theme_code=${themeCode}`);
      const json = await res.json();
      setNewsData(json);
      console.log("📰 받은 뉴스 데이터:", json); 
    } catch (e) {
      console.error("뉴스 불러오기 실패:", e);
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

      {selectedThemeCode && (
        <div style={{ marginTop: "2rem" }}>
          <h3 className="text-lg font-semibold mb-2">
            📰 {selectedThemeName} 관련 뉴스
          </h3>
          <NewsListings news={newsData} />
        </div>
      )}
    </div>
  );
};

export default ChartRealtime;