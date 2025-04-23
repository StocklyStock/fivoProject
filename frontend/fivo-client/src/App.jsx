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
import FAQsPage from './pages/FAQsPage';
import AboutPage from './pages/AboutPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AIRecommPage from './pages/AIRcommPage';
import TermsPage from './pages/TermsPage';
import PolicyPage from './pages/PolicyPage';
// import NoticesPage from './pages/NoticesPage';
// import NoticeDetailPage, {noticeLoader} from './pages/NoticeDetailPage';

// 라우터 설정
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      {/* ✅ 공개 경로 */}
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="verify" element={<VerifyEmailPage />} />
      <Route path="faq" element={<FAQsPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="policy" element={<PolicyPage />} />
      {/* <Route path="notices" element={<NoticesPage />} />
      <Route 
      path="/notices/:id" 
      element={<NoticeDetailPage />}
      loader={noticeLoader} 
      /> */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ✅ 종목 상세 페이지 - 로그인/비로그인 모두 접근 가능 */}
      <Route path="stock/:stockId" element={<StockDetailPage />} />

      <Route path="airecomm" element={<AIRecommPage />} />

      {/* ✅ 일반 사용자 대시보드 */}
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* ✅ 관리자 전용 섹션 */}
      <Route
        path="admin"
        element={
          <RequireAuth adminOnly>
            <AdminLayout />
          </RequireAuth>
        }
      >
        {/* ✅ 관리자 진입 시 /admin → /admin/stats 로 리디렉션
        뺸 이유 : 이러면 관리자 전용 섹션으로 진입불가라서 */}
        <Route index element={<Navigate to="/admin/stats" replace />} />
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
