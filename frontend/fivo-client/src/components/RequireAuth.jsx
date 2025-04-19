import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children, adminOnly = false }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ 관리자 여부를 정확하게 확인
  if (adminOnly && !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireAuth;
