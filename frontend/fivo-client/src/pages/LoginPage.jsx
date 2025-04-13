import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link
} from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/fivo_logo.png'; // 로고 경로

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const response = await axios.post('/api/accounts/login/', { email, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      dispatch(loginSuccess({ user, access, refresh }));

      if (user.role === 'admin' || user.is_staff) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('로그인 실패! 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Box className="flex flex-col items-center mb-6">
          <Typography variant="h5" fontWeight="bold">
            <img src={Logo} alt="FIVO 로고" className="w-48" />
            </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="이메일"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          inputProps={{ maxLength: 30 }}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="비밀번호"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          inputProps={{ maxLength: 30 }}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          로그인
        </Button>

        <Box className="mt-4 text-center">
          <Typography variant="body2">
            아직 회원이 아니신가요?{' '}
            <Link href="/register" underline="hover">
              회원가입
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
