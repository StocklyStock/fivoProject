import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTreemapData,
  setSelectedTheme,
  fetchThemeData,
} from "../slices/themeSlice";
import Treemap from "./Treemap";

const ChartRealtime = () => {
  const dispatch = useDispatch();
  const { data, selectedThemeCode } = useSelector((state) => state.theme);

  useEffect(() => {
    const savedData = localStorage.getItem("lastTreemapData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      dispatch(setTreemapData(parsed));
    }

    let socket;

    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8000/ws/theme");

      socket.onopen = () => {
        console.log("✅ WebSocket 연결");
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

        // ✅ selectedThemeCode가 없을 때만 자동 선택
        if (!selectedThemeCode && converted.children.length > 0) {
          const maxItem = converted.children.reduce((prev, curr) =>
            curr.value > prev.value ? curr : prev
          );

          dispatch(
            setSelectedTheme({
              themeCode: maxItem.theme_code,
              themeName: maxItem.name,
            })
          );
          dispatch(fetchThemeData(maxItem.theme_code));
        }
      };

      socket.onclose = () => {
        console.warn("📴 WebSocket 종료됨. 3초 후 재연결 시도...");
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket 오류:", err);
      };
    };

    connectWebSocket();

    return () => socket && socket.close();
  }, [dispatch, selectedThemeCode]);

  const handleThemeClick = (themeCode) => {
    const matched = data.children.find((item) => item.theme_code === themeCode);
    const themeName = matched?.name ?? "";

    dispatch(setSelectedTheme({ themeCode, themeName }));
    dispatch(fetchThemeData(themeCode));
  };

  return (
    <section className="chart-realtime ">
      <div className="realtime-wrapper">
        <h2 className="text-xl font-bold mb-4">📈 실시간 테마주 트리맵</h2>

        <div style={{ width: "100%" }}>
          <Treemap data={data} onThemeClick={handleThemeClick} />
        </div>
      </div>
    </section>
  );
};

export default ChartRealtime;