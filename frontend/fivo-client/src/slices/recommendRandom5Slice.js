import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchRecommendedStocks } from "../services/recommendRandom5";

export const getRecommendedStocks = createAsyncThunk(
  "stocks/getRecommendedStocks",
  async () => {
    const data = await fetchRecommendedStocks();
    return data;
  }
);

const recommendRandom5Slice = createSlice({
  name: "stocks",
  initialState: {
    stocks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRecommendedStocks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecommendedStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload;
      })
      .addCase(getRecommendedStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default recommendRandom5Slice.reducer;