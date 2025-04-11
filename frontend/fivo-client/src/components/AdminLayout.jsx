// 📄 src/components/AdminLayout.jsx

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, Button } from '@mui/material';
import Header from './Header'; // ✅ 헤더 import

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (_, newValue) => {
    navigate(newValue);
  };

  return (
    <>
      <Header /> {/* ✅ 헤더 추가 */}

      <Box className="p-6">
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" fontWeight="bold">
            🛠 관리자 페이지
          </Typography>
          <Button color="error" variant="outlined" onClick={() => navigate('/login')}>
            로그아웃
          </Button>
        </Box>

        <Paper elevation={1} className="rounded-xl overflow-hidden mb-4">
          <Tabs
            value={location.pathname}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="📊 통계 보기" value="/admin/stats" />
            <Tab label="👥 사용자 목록" value="/admin/users" />
            <Tab label="🔔 알림 설정" value="/admin/notifications" />
          </Tabs>
        </Paper>

        <Outlet />
      </Box>
    </>
  );
};

export default AdminLayout;
