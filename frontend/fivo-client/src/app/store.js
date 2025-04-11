// 📄 src/app/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../auth/authSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import { combineReducers } from 'redux'
import { thunk } from 'redux-thunk' // ✅ 여기 수정


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // ✅ auth slice만 localStorage에 저장
}

const rootReducer = combineReducers({
  auth: authReducer,
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
