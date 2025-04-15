import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Dashboard from './pages/Dashboard';
import AdminStats from './pages/AdminStats';
import AdminUsers from './pages/AdminUsers';
import AdminNotifications from './pages/AdminNotifications';
import StockDetailPage from './pages/StockDetailPage';

import RequireAuth from './components/RequireAuth';
import AdminLayout from './components/AdminLayout';
import MainLayout from './layouts/MainLayout';

// 라우터 설정
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      {/* ✅ 공개 경로 */}
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="verify" element={<VerifyEmailPage />} />

      {/* ✅ 종목 상세 페이지 - 로그인/비로그인 모두 접근 가능 */}
      <Route path="stock/:stockId" element={<StockDetailPage />} />

      {/* ✅ 일반 사용자 대시보드 */}
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* ✅ 관리자 진입 시 /admin → /admin/stats 로 리디렉션
      뺸 이유 : 이러면 관리자 전용 섹션으로 진입불가라서
      <Route path="admin" element={<Navigate to="admin/stats" replace />} /> */}

      {/* ✅ 관리자 전용 섹션 */}
      <Route
        path="admin"
        element={
          <RequireAuth adminOnly>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="stats" element={<AdminStats />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>
    </Route>
  )
);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer // ✅ 전역 위치에 선언!
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
  
};

export default App;
