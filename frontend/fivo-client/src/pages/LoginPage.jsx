import { useState } from 'react';
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Paper,
//   Alert,
//   Link
// } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
//import Logo from '../assets/fivo_logo.png'; // 로고 경로

import googleLogo from '../assets/google-brand.svg';
import naverLogo from '../assets/naver-brand.svg';
import kakaoLogo from '../assets/kakao-brand.svg';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
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
    <section className="login">

        {/* <Box className="flex flex-col items-center mb-6">
          <Typography variant="h5" fontWeight="bold">
            <img src={Logo} alt="FIVO 로고" className="w-48" />
            </Typography>
        </Box> */}
      <div className='sns'>
        <h2>간편 로그인</h2>
        <ul>
          <li><a href="#" onClick={(e) =>{e.preventDefault(); console.log("SNS로그인 구현 예정!")}}><img src={googleLogo} alt="구글 회원가입" /></a></li>
          <li><a href="#" onClick={(e) =>{e.preventDefault(); console.log("SNS로그인 구현 예정!")}}><img src={naverLogo} alt="네이버 회원가입" /></a></li>
          <li><a href="#" onClick={(e) =>{e.preventDefault(); console.log("SNS로그인 구현 예정!")}}><img src={kakaoLogo} alt="카카오 회원가입" /></a></li>
        </ul>
      </div>

      {error && <span class="login-error" severity="error">{error}</span>}

      <div className='border-wrap'>
        <form className="">
          {/* <h2>
            🔐 로그인
          </h2> */}

          <label htmlFor="email" className={`floating-label ${email ? 'active' : ''}`}>
            <span>아이디(이메일 주소)</span>
            <input
              id="email"
              label="이메일"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label htmlFor="password" className={`floating-label ${password ? 'active': ''}`}>
          <span>패스워드</span>
            <input
              id="password"
              label="비밀번호"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <span class="login-error" severity="error">{error}</span>}

          <button
            variant="contained"
            color="primary"
            className=""
            onClick={handleLogin}
          >
            로그인
          </button>
    
        </form>
        <div className='find-account'>
          <Link to="/find-id">아이디 찾기</Link>
          <Link to="/find-password">비밀번호 찾기</Link>
        </div>
        <div className='register-wrap'>
            <p><span>FIVO 회원이 아니신가요?</span></p>
            <Link to="/register">회원가입</Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
