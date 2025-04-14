import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getThemeData } from "../services/themeService";

export const fetchThemeData = createAsyncThunk(
  "theme/fetchThemeData",
  async (themeCode) => {
    const response = await getThemeData(themeCode);
    return response; // { news: [...], stocks: [...] }
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
    builder.addCase(fetchThemeData.fulfilled, (state, action) => {
      state.news = action.payload.news;
      state.stocks = action.payload.stocks;
    });
  },
});

export const { setTreemapData, setSelectedTheme } = themeSlice.actions;
export default themeSlice.reducer;