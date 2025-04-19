import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { thunk } from "redux-thunk"; // ✅ thunk middleware
import authReducer from "../slices/authSlice";
import themeReducer from "../slices/themeSlice";
import recommendRandomReducer from "../slices/recommendRandom5Slice";
import recommendUserReducer from "../slices/recommendUserSlice";
import favoritesReducer from "../slices/favoriteSlice";

// ✅ persist 설정
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // 🔒 auth만 저장 (JWT 등)
};

// ✅ root reducer 구성
const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  recommend5: recommendRandomReducer,
  userRecommendedStocks: recommendUserReducer,
  favorites: favoritesReducer,
});

// ✅ persist 적용된 reducer 생성
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ store 생성
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist의 비직렬화 경고 무시
    }).concat(thunk),
});

// ✅ persistor 생성
export const persistor = persistStore(store);
