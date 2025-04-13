import React, { useState } from "react";
import Slider from '../components/Slider';
import ChartRealtime from '../components/ChartRealtime';
import ThemeListings from '../components/ThemeListings';
import NewsListings from '../components/NewsListings';
import ChatBotModal from '../components/ChatbotModal';

// 📄 src/pages/HomePage.jsx
const HomePage = () => {
  const [selectedThemeCode, setSelectedThemeCode] = useState(null);
  const [selectedThemeName, setSelectedThemeName] = useState("");
  const [newsData, setNewsData] = useState([]);
  const [stockList, setStockList] = useState([]);
    return (
      <main>
        {/* <h1 className="text-2xl p-10">🏠 홈 화면 - 누구나 접근 가능</h1> */}
        <Slider />
        <ChartRealtime
        onThemeChange={(code, name) => {
          setSelectedThemeCode(code);
          setSelectedThemeName(name);
        }}
        onNewsFetched={(news) => {
          setNewsData(news)
        }}
        onStocksFetched={(stock_list) =>{
          setStockList(stock_list)
        }}
      />
        <ChatBotModal />
        <div className='brand-bg-color main-listings'>
          <ThemeListings
            stock_list={stockList}
          />
          <NewsListings
            themeCode={selectedThemeCode}
            themeName={selectedThemeName}
            news={newsData}
          />
        </div>
      </main>
    )
  };
  export default HomePage;
  