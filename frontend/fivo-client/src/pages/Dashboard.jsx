// 📄 src/pages/Dashboard.jsx

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { BarChart2, Bell, UserCheck } from 'lucide-react';
import Layout from '../components/Layout';

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Layout>
      <Box className="min-h-[calc(100vh-72px)] p-6 max-w-6xl mx-auto">
        <Card className="p-6">
          <Box className="flex justify-between items-center mb-6">
            <Typography variant="h5" fontWeight="bold">
              👋 {user?.nickname || '사용자'}님, 환영합니다!
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
              로그아웃
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            📊 대시보드 내용
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            여기에 최근 활동, 공지사항, 사용자 알림 등을 넣을 수 있어요.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="rounded-2xl shadow-md">
                <CardContent className="text-center">
                  <BarChart2 className="mx-auto mb-2" />
                  <Typography variant="subtitle1">통계 보기</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className="rounded-2xl shadow-md">
                <CardContent className="text-center">
                  <UserCheck className="mx-auto mb-2" />
                  <Typography variant="subtitle1">사용자 목록</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className="rounded-2xl shadow-md">
                <CardContent className="text-center">
                  <Bell className="mx-auto mb-2" />
                  <Typography variant="subtitle1">알림 설정</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Layout>
  );
};

export default Dashboard;
