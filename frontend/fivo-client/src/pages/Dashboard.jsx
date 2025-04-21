// 프로필 페이지: Dashboard.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setUser } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
} from '@mui/material';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import {
  updateUserInfo,
  deleteAccount,
  getCurrentUser,
  changePassword,
} from '../services/user';
import {
  getFavoriteStocks,
  deleteFavoriteByCode,
} from '../services/favoriteApi';

import stockList from '../../../../backend/fastapi-stream/app/data/stock_list.json';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [investmentStyle, setInvestmentStyle] = useState('');
  const [investmentPeriod, setInvestmentPeriod] = useState(0);
  const [tradingFrequency, setTradingFrequency] = useState(0);
  const [ownedStocks, setOwnedStocks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

    // ✅ 종목명 → 종목코드 매핑
  const stockNameToCode = {};
  stockList.forEach((item) => {
    stockNameToCode[item['회사명']] = item['종목코드'];
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        dispatch(setUser(res.data));
        setNickname(res.data.nickname || '');
        setPhone(res.data.phone || '');
        setDateJoined(res.data.date_joined || '');
        setIsVerified(res.data.is_verified || false);
        setInvestmentStyle(res.data.investment_style || '');
        setInvestmentPeriod(res.data.investment_period_months || 0);
        setTradingFrequency(res.data.trading_frequency || 0);
        setOwnedStocks(
          typeof res.data.owned_stocks === 'string'
            ? res.data.owned_stocks.split(',')
            : res.data.owned_stocks || []
        );
      } catch (e) {
        toast.error('유저 정보를 불러오지 못했습니다.');
      }
    };
    fetchUser();
  }, [dispatch]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getFavoriteStocks();
        setFavorites(res.data);
      } catch (e) {
        toast.error('즐겨찾기 정보를 불러오지 못했습니다.');
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
      setFavorites((prev) => prev.filter((f) => f.stock_code !== stockCode));
    } catch (e) {
      toast.error(`삭제 실패: ${e.response?.data?.error || '오류 발생'}`);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUserInfo({ nickname, phone });
      toast.success('회원 정보가 수정되었어요!');
      setOpenEdit(false);
      const res = await getCurrentUser();
      dispatch(setUser(res.data));
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
    <Layout className="dashboard">
      <Box sx={{ background: '#f8f8f8', py: 4, px: 2, maxWidth: '720px', mx: 'auto' }}>
        <Card sx={{ mb: 4, p: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {nickname || '사용자'} 님 안녕하세요
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  전화번호: {phone || '미입력'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  가입일: {dateJoined ? dateJoined.slice(0, 10) : '미입력'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  인증 여부: {isVerified ? '인증됨' : '미인증'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box mt={2}>
            <div className='btn-wrap'>
              <Button onClick={() => setOpenEdit(true)} variant="outlined" sx={{ mr: 1 }}>
                회원정보 수정
              </Button>
              <Button onClick={() => setOpenPassword(true)} variant="outlined" color="secondary">
                비밀번호 변경
              </Button>
            </div>
            <button 
              type="button"
              className="logout-btn"
              onClick={() => {
                console.log('🚀 로그아웃 클릭됨');
                dispatch(logout());
                setTimeout(() => navigate('/', { replace: true }), 0);
              }}
            >
              로그아웃
            </button>
          </Box>
        </Card>

        <Box sx={{ mb: 4, backgroundColor: '#fff', borderRadius: 3, px: 3, py: 4, boxShadow: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            📌 나의 투자 성향 및 활동
          </Typography>
          <Box display="flex" justifyContent="space-around" textAlign="center">
            <Box>
              <Typography fontSize="1.5rem" fontWeight="bold" color="primary.main">
                {investmentStyle || '미지정'}
              </Typography>
              <Typography variant="body2">투자자 성향</Typography>
            </Box>
            <Box>
              <Typography fontSize="1.3rem" fontWeight="medium">
                약 {Math.round(investmentPeriod / 30)}개월
              </Typography>
              <Typography variant="body2">투자 기간</Typography>
            </Box>
            <Box>
              <Typography fontSize="1.3rem" fontWeight="medium">
                {tradingFrequency}회/월
              </Typography>
              <Typography variant="body2">매매 빈도</Typography>
            </Box>
          </Box>
        </Box>

        <Card sx={{ mb: 4, p: 3 }}>
          <Typography fontWeight="bold" gutterBottom>
            📦 보유 종목
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="start">
            {ownedStocks.map((name, idx) => {
              const stockCode = stockNameToCode[name];
              return (
                <Box
                  key={idx}
                  onClick={() => stockCode && navigate(`/stock/${stockCode}`)}
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    minWidth: '180px',
                    textAlign: 'center',
                    cursor: stockCode ? 'pointer' : 'default',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <Typography fontWeight="bold" fontSize="1.1rem">
                    {name}
                  </Typography>
                  {stockCode && (
                    <Typography color="text.secondary" fontSize="0.9rem">
                      ({stockCode})
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Card>

        <Card sx={{ mb: 4, p: 3 }}>
          <Typography fontWeight="bold" gutterBottom>
            ⭐ 즐겨찾기 종목
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="start">
            {favorites.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  border: '1px solid #f28c28',
                  backgroundColor: '#fff6ed',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  minWidth: '180px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': {
                    backgroundColor: '#fff0e0',
                  },
                }}
                onClick={() => navigate(`/stock/${item.stock_code}`)}
              >
                <Typography fontWeight="bold" fontSize="1.1rem">
                  {item.stock_name}
                </Typography>
                <Typography color="text.secondary" fontSize="0.9rem">
                  ({item.stock_code})
                </Typography>

                {/* 삭제 버튼 (X) */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFavorite(item.stock_code);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 20,
                    height: 20,
                    fontSize: '0.8rem',
                    borderRadius: '50%',
                    backgroundColor: '#f28c28',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        {/* 회원정보 수정 */}
        <Dialog className="edit-info-modal" open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>회원정보 수정</DialogTitle>
          <DialogContent>
            <TextField label="닉네임" fullWidth margin="normal" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            <TextField label="전화번호" fullWidth margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>취소</Button>
            <Button onClick={handleUpdate} variant="contained">수정</Button>
            <Button onClick={handleDelete} color="error">회원 탈퇴</Button>
          </DialogActions>
        </Dialog>

        {/* 비밀번호 변경 */}
        <Dialog className="edit-pw-modal" open={openPassword} onClose={() => setOpenPassword(false)}>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogContent>
            <TextField label="현재 비밀번호" type="password" fullWidth margin="normal" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <TextField label="새 비밀번호" type="password" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <TextField label="새 비밀번호 확인" type="password" fullWidth margin="normal" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPassword(false)}>취소</Button>
            <Button variant="contained" onClick={handleChangePassword}>변경</Button>
          </DialogActions>
      
        </Dialog>

  
      </Box>
      
    </Layout>
  );
};

export default Dashboard;