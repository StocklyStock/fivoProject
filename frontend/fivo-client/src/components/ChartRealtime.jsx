import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Treemap from "./Treemap";
import {
  setTreemapData,
  setSelectedTheme,
  fetchThemeNews,
  fetchThemeStocks,
} from "../slices/themeSlice";

const ChartRealtime = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.theme);

  useEffect(() => {
    // 처음 마운트될 때: 로컬 저장된 트리맵 데이터 불러오기
    const savedData = localStorage.getItem("lastTreemapData");
    if (savedData) {
      dispatch(setTreemapData(JSON.parse(savedData)));
    }

    let socket;

    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8000/ws/theme");

      socket.onopen = () => {
        console.log("✅ WebSocket 연결됨");
      };

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

        dispatch(setTreemapData(converted));
        localStorage.setItem("lastTreemapData", JSON.stringify(converted));
      };

      socket.onclose = () => {
        console.warn("📴 WebSocket 연결 종료됨. 3초 후 재연결 시도...");
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket 오류 발생:", err);
      };
    };

    connectWebSocket();

    return () => socket && socket.close();
  }, [dispatch]);

  const handleThemeClick = (themeCode) => {
    const matched = data.children.find((item) => item.theme_code === themeCode);
    const themeName = matched?.name ?? "";

    // 선택한 테마 상태 저장
    dispatch(setSelectedTheme({ themeCode, themeName }));

    // 뉴스 & 종목 비동기 fetch
    dispatch(fetchThemeNews(themeCode));
    dispatch(fetchThemeStocks(themeCode));
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
