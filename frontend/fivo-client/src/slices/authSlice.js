import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, access, refresh } = action.payload;
      state.user = user; // ✅ role 포함된 user 전체 저장
      state.accessToken = access;
      state.refreshToken = refresh;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
     /*2025-04-18 정보 갱신용 - 박홍덕 - start*/ 
    setUser: (state, action) => {
      state.user = action.payload;
    }
     /*2025-04-18 정보 갱신용 - 박홍덕 - end*/ 
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
