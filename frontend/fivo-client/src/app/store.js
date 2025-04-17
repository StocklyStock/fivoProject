// 📄 src/app/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import { combineReducers } from 'redux'
import { thunk } from 'redux-thunk' // ✅ 여기 수정
import themeReducer from "../slices/themeSlice";
import recommendRandomReducer from "../slices/recommendRandom5Slice";
import favoritesReducer from '../slices/favoriteSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // ✅ auth slice만 localStorage에 저장
}

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  recommend5: recommendRandomReducer,
  favorites: favoritesReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 🔥 redux-persist에서 필요
    }).concat(thunk),
})

export const persistor = persistStore(store)
