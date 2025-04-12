import React, { useEffect, useState } from "react";
import NewsListings from "./NewsListings";

const NewsContainer = ({ themeCode }) => {
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`http://localhost:8000/theme/news?theme_code=${themeCode}`);
        const raw = await res.json();
        const formatted = raw.map((item) => ({
          title: item.title,
          summary: item.summary,
          url: item.url,
          date: item.news_date,
        }));
        setNewsData(formatted);
      } catch (err) {
        console.error("❌ 뉴스 fetch 에러:", err);
      }
    };

    if (themeCode) fetchNews();
  }, [themeCode]);

  return <NewsListings news={newsData} />;
};

export default NewsContainer;
