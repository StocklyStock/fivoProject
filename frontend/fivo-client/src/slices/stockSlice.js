// src/slices/stockSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchStockSummary, fetchCandles } from "../services/stockapi"; // API 호출 함수

// Thunks for fetching data
export const fetchStockSummaryData = createAsyncThunk(
  "stock/fetchSummary",
  async (symbol) => {
    const response = await fetchStockSummary(symbol);
    return response;
  }
);

export const fetchCandlesData = createAsyncThunk(
  "stock/fetchCandles",
  async ({ symbol, timeframe }) => {
    const response = await fetchCandles(symbol, timeframe);
    return response;
  }
);

const initialState = {
  stockSummary: null,
  stockCandles: [],
  loading: false,
  error: null,
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch stock summary
    builder.addCase(fetchStockSummaryData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchStockSummaryData.fulfilled, (state, action) => {
      state.loading = false;
      state.stockSummary = action.payload;
    });
    builder.addCase(fetchStockSummaryData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Fetch candles data
    builder.addCase(fetchCandlesData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCandlesData.fulfilled, (state, action) => {
      state.loading = false;
      state.stockCandles = action.payload;
    });
    builder.addCase(fetchCandlesData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default stockSlice.reducer;
