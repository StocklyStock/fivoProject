import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { toast } from 'react-toastify';

// 📦 Async Actions
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, thunkAPI) => {
    const res = await api.get('/api/favorites/');
    return res.data;
  }
);

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async ({ stock_code, stock_name }, thunkAPI) => {
    const res = await api.post('/api/favorites/', { stock_code, stock_name });
    return res.data;
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (favoriteId, thunkAPI) => {
    await api.delete(`/api/favorites/${favoriteId}/`);
    toast.info('🗑️ 즐겨찾기 제거됨');
    return favoriteId;
  }
);

// 🔧 Slice
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default favoritesSlice.reducer;