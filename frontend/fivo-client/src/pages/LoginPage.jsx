import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import api from '../services/api';

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
      const response = await api.post('/api/accounts/login/', { email, password });
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
      {error && <span className="login-error">{error}</span>}

      <div className="border-wrap">
        <form onSubmit={handleLogin}>
          <label htmlFor="email" className={`floating-label ${email ? 'active' : ''}`}>
            <span>아이디(이메일 주소)</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label htmlFor="password" className={`floating-label ${password ? 'active' : ''}`}>
            <span>패스워드</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="">
            로그인
          </button>
        </form>

        <div className="sns">
          <h2>간편 로그인</h2>
          <ul>
            <li>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const idToken = credentialResponse.credential;
                  try {
                    const res = await api.post('/api/accounts/google-login/', {
                      id_token: idToken,
                    });
                    const { user, access, refresh } = res.data;

                    localStorage.setItem('accessToken', access);
                    localStorage.setItem('refreshToken', refresh);

                    dispatch(loginSuccess({ user, access, refresh }));
                    toast.success('✅ 구글 로그인 성공!');

                    if (user.role === 'admin' || user.is_staff) {
                      navigate('/admin');
                    } else {
                      navigate('/dashboard');
                    }
                  } catch (err) {
                    toast.error('❌ 구글 로그인 실패');
                  }
                }}
                onError={() => {
                  toast.error('❌ 구글 로그인에 실패했습니다.');
                }}
              />
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('SNS로그인 구현 예정!');
                }}
              >
                <img src={naverLogo} alt="네이버 회원가입" />
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('SNS로그인 구현 예정!');
                }}
              >
                <img src={kakaoLogo} alt="카카오 회원가입" />
              </a>
            </li>
          </ul>
        </div>

        <div className="find-account">
          <Link to="/find-id">아이디 찾기</Link>
          <Link to="/reset-password" underline="hover">비밀번호 찾기</Link>
        </div>
        <div className="register-wrap">
          <p>
            <span>FIVO 회원이 아니신가요?</span>
          </p>
          <Link to="/register">회원가입</Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
