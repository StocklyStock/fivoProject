import React, { useState } from "react";
import "./NewsListings.css"; // 선택사항: 스타일 분리 시

const NewsListings = ({ news = [] }) => {
  console.log("🧪 NewsListings에 전달된 뉴스:", news);
  const [selectedUrl, setSelectedUrl] = useState(null);

  return (
    <div>
      <div className="headline-wrap">
        <h2><span>관련 뉴스</span></h2>
      </div>

      <div className="list-wrap">
        <ul>
          {news.length === 0 ? (
            <li>관련 뉴스를 불러오는 중이거나 없습니다.</li>
          ) : (
            news.map((item, idx) => (
              <li key={idx} onClick={() => setSelectedUrl(item.url)} style={{ cursor: "pointer" }}>
                {item.title}
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedUrl && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
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
                backgroundColor: "#f5f5f5"
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
  );
};


export default NewsListings;