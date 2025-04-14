export const getThemeNews = async (themeCode) => {
    const res = await fetch(`http://localhost:8000/theme/news?theme_code=${themeCode}`);
    return res.json();
  };
  
  export const getThemeStocks = async (themeCode) => {
    const res = await fetch(`http://localhost:8000/theme/stock_list?theme_code=${themeCode}`);
    return res.json();
  };
  