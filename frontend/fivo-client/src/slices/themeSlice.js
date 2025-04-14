import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getThemeNews, getThemeStocks } from "../services/themeService";

export const fetchThemeNews = createAsyncThunk(
  "theme/fetchNews",
  async (themeCode) => {
    return await getThemeNews(themeCode);
  }
);

export const fetchThemeStocks = createAsyncThunk(
  "theme/fetchStocks",
  async (themeCode) => {
    return await getThemeStocks(themeCode);
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    data: { name: "테마주", children: [] },
    news: [],
    stocks: [],
    selectedThemeCode: null,
    selectedThemeName: "",
  },
  reducers: {
    setTreemapData: (state, action) => {
      state.data = action.payload;
    },
    setSelectedTheme: (state, action) => {
      const { themeCode, themeName } = action.payload;
      state.selectedThemeCode = themeCode;
      state.selectedThemeName = themeName;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemeNews.fulfilled, (state, action) => {
        state.news = action.payload;
      })
      .addCase(fetchThemeStocks.fulfilled, (state, action) => {
        state.stocks = action.payload;
      });
  },
});

export const { setTreemapData, setSelectedTheme } = themeSlice.actions;
export default themeSlice.reducer;
