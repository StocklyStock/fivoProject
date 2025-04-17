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
import { updateUserInfo, deleteAccount, getCurrentUser, changePassword } from '../services/user';
import {getFavoriteStocks, deleteFavoriteByCode} from '../services/favoriteApi'

const Dashboard = () => {
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  const [favorites, setFavorites] = useState([]);

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
  
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getFavoriteStocks();
        setFavorites(res.data);  // 또는 .results로 변경
      } catch (e) {
        toast.error('즐겨찾기 정보를 불러오지 못했습니다.');
        console.error(e);
      }
    };
  
    fetchFavorites();
  }, []);

  const handleDeleteFavorite = async (stockCode) => {
    const target = favorites.find((f) => f.stock_code === stockCode);

    if (!window.confirm(`${target?.stock_name || stockCode} 즐겨찾기를 삭제할까요?`)) return;

    try {
      await deleteFavoriteByCode(stockCode);
      toast.success(`${target?.stock_name || stockCode} 삭제 완료!`);
  
      // 목록 갱신
      setFavorites((prev) => prev.filter((f) => f.stock_code !== stockCode));
    } catch (e) {
      toast.error(`삭제 실패: ${e.response?.data?.error || '오류 발생'}`);
      console.error(e);
    }
  };
  

  const handleUpdate = async () => {
    try {
      await updateUserInfo({ nickname, phone });
      toast.success('회원 정보가 수정되었어요!');
      setOpenEdit(false);
    } catch (e) {
      toast.error('수정 실패: ' + (e.response?.data?.error || '오류 발생'));
    }
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== newPassword2) {
        toast.error('새 비밀번호가 일치하지 않습니다.');
        return;
      }
  
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
  
      toast.success('비밀번호가 성공적으로 변경됐어요!');
      setOpenPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setNewPassword2('');
    } catch (e) {
      console.error("❌ change-password 응답:", e.response?.data);
      const data = e.response?.data || {};
      const allErrors = Object.values(data).flat().join(' ') || '오류 발생';
      toast.error('변경 실패: ' + allErrors);
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
              <Button onClick={() => setOpenPassword(true)} variant="outlined" color="secondary">
                비밀번호 변경
              </Button>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            📊 대시보드 내용
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📌 나의 투자 프로필
          </Typography>

          <Typography>👤 투자자 성향: <strong>{reduxUser?.investment_style || '미지정'}</strong></Typography>
          <Typography>
            ⏳ 투자 기간: <strong>
              약 {Math.round((reduxUser?.investment_period_months || 0) / 30)}개월
            </strong>
          </Typography>
          <Typography>📈 매매 빈도: <strong>{reduxUser?.trading_frequency}회/월</strong></Typography>

          <Typography sx={{ mt: 1 }}>📦 보유 종목:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {(typeof reduxUser?.owned_stocks === 'string'
              ? JSON.parse(reduxUser.owned_stocks)
              : reduxUser.owned_stocks || []
            ).map((stock, idx) => (
              <span key={idx} className="bg-gray-200 dark:bg-gray-700 text-sm rounded-xl px-2 py-1">
                {stock}
              </span>
            ))}
          </Box>
          <Typography sx={{ mt: 2 }}>⭐ 즐겨찾기 종목:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {(favorites || []).map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'lightyellow',
                  px: 1,
                  py: 0.5,
                  borderRadius: '16px',
                  gap: 0.5,
                }}
              >
                <span>{item.stock_name} ({item.stock_code})</span>
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => handleDeleteFavorite(item.stock_code)}
                >
                  ✕
                </Button>
              </Box>
            ))}
          </Box>       
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

        {/* 🔐 비밀번호 변경 Dialog */}
        <Dialog open={openPassword} onClose={() => setOpenPassword(false)}>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogContent>
            <TextField
              label="현재 비밀번호"
              type="password"
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="새 비밀번호"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPassword(false)}>취소</Button>
            <Button variant="contained" onClick={handleChangePassword}>
              변경
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Dashboard;
