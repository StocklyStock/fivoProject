import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserRecommendedStocks } from "../services/recommendUser";

export const getUserRecommendedStocks = createAsyncThunk(
  "stocks/getUserRecommendedStocks",
  async () => {
    const data = await fetchUserRecommendedStocks();
    return data;
  }
);

const recommendUserSlice = createSlice({
  name: "userRecommendedStocks",
  initialState: {
    userStocks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserRecommendedStocks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserRecommendedStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.userStocks = action.payload;
      })
      .addCase(getUserRecommendedStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default recommendUserSlice.reducer;
