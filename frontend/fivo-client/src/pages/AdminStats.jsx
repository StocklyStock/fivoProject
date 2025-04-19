import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 📈 Chart.js 세팅
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminStats = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [verificationRate, setVerificationRate] = useState(0);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/accounts/admin/stats/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTotalUsers(res.data.total_users);
        setVerificationRate(res.data.verification_rate);
        setDailyData(res.data.daily_signups);
      } catch (error) {
        console.error('📛 관리자 통계 조회 실패:', error);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: dailyData.map((d) => d.day.slice(5)), // 'MM-DD'
    datasets: [
      {
        label: '일간 가입자 수',
        data: dailyData.map((d) => d.count),
        borderColor: '#1976d2',
        backgroundColor: '#1976d240',
        tension: 0.4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: Math.max(...dailyData.map(d => d.count)) + 1,
        ticks: { stepSize: 1 },
      },
    },
  };
  

  return (
    <Box className="p-6">
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📊 관리자 기능: 통계 보기
      </Typography>

      <Grid container spacing={3} mt={2}>
        {/* 누적 가입자 수 카드 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon fontSize="large" />
            <Box>
              <Typography variant="body1">누적 가입자 수</Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalUsers}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* 인증 완료율 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Box position="relative" display="inline-flex">
              <CircularProgress
                variant="determinate"
                value={verificationRate}
                size={100}
                thickness={5}
              />
              <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="h6">
                  {verificationRate}%
                </Typography>
              </Box>
            </Box>
            <Typography mt={2}>이메일 인증 완료율</Typography>
          </Card>
        </Grid>

        {/* 일간 가입자 수 차트 */}
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              최근 7일간 가입자 추이
            </Typography>
            <Line data={chartData} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminStats;
