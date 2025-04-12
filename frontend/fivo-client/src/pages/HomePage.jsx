import React from 'react'
import Slider from '../components/Slider';
import ChartRealtime from '../components/ChartRealtime';
import ThemeListings from '../components/ThemeListings';
import NewsListings from '../components/NewsListings';
import ChatBotModal from '../components/ChatbotModal';

// 📄 src/pages/HomePage.jsx
const HomePage = () => {
    return (
      <main>
        {/* <h1 className="text-2xl p-10">🏠 홈 화면 - 누구나 접근 가능</h1> */}
        <Slider />
        <ChartRealtime />
        <ChatBotModal />
        <div className='brand-bg-color main-listings'>
          <ThemeListings />
          <NewsListings />
        </div>
      </main>
    )
  };
  export default HomePage;
  