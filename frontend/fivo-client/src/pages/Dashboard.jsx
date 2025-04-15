// 📄 src/pages/Dashboard.jsx
// 📄 src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { BarChart2, Bell, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { updateUserInfo, deleteAccount, getCurrentUser } from '../services/user';

const Dashboard = () => {
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openEdit, setOpenEdit] = useState(false);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  // ✅ 마이페이지 진입 시 유저 정보 직접 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setNickname(res.data.nickname || '');
        setPhone(res.data.phone || '');
      } catch (e) {
        toast.error('유저 정보를 불러오지 못했습니다.');
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      await updateUserInfo({ nickname, phone });
      toast.success('회원 정보가 수정되었어요!');
      setOpenEdit(false);
    } catch (e) {
      toast.error('수정 실패: ' + (e.response?.data?.error || '오류 발생'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 탈퇴하시겠어요? 되돌릴 수 없어요!')) return;
    try {
      await deleteAccount();
      dispatch(logout());
      toast.success('탈퇴 완료. 그동안 감사했어요!');
      navigate('/login');
    } catch (e) {
      toast.error('탈퇴 실패: ' + (e.response?.data?.error || '오류 발생'));
    }
  };

  return (
    <Layout>
      <Box className="min-h-[calc(100vh-72px)] p-6 max-w-6xl mx-auto">
        <Card className="p-6">
          <Box className="flex justify-between items-center mb-6">
            <Typography variant="h5" fontWeight="bold">
              👋 {reduxUser?.nickname || '사용자'}님, 환영합니다!
            </Typography>
            <Box>
              <Button onClick={() => setOpenEdit(true)} variant="outlined" sx={{ mr: 1 }}>
                회원정보 수정
              </Button>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            📊 대시보드 내용
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="rounded-2xl shadow-md text-center p-4">
                <BarChart2 className="mx-auto mb-2" />
                <Typography variant="subtitle1">통계 보기</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="rounded-2xl shadow-md text-center p-4">
                <UserCheck className="mx-auto mb-2" />
                <Typography variant="subtitle1">사용자 목록</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="rounded-2xl shadow-md text-center p-4">
                <Bell className="mx-auto mb-2" />
                <Typography variant="subtitle1">알림 설정</Typography>
              </Card>
            </Grid>
          </Grid>
        </Card>

        {/* ✏️ 회원정보 수정 Dialog */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>회원정보 수정</DialogTitle>
          <DialogContent>
            <TextField
              label="닉네임"
              fullWidth
              margin="normal"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <TextField
              label="전화번호"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>취소</Button>
            <Button onClick={handleUpdate} variant="contained">수정</Button>
            <Button onClick={handleDelete} color="error">회원 탈퇴</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Dashboard;
