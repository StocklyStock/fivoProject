import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';

import googleLogo from '../assets/google-brand.svg'
import naverLogo from '../assets/naver-brand.svg'
import kakaoLogo from '../assets/kakao-brand.svg'
import api from '../services/api'

const ERROR_TRANSLATIONS = {
  'This password is too common.': '비밀번호가 너무 쉬워요. 다른 비밀번호를 입력해주세요.',
  'This password is too short. It must contain at least 8 characters.': '비밀번호가 너무 짧아요. 최소 8자를 입력해주세요.',
  'This field may not be blank.': '필수 입력 항목이 비어있습니다.',
  'Enter a valid email address.': '올바른 이메일 형식을 입력해주세요.',
  '비밀번호가 일치하지 않습니다.': '비밀번호가 서로 일치하지 않아요!',
  'user with this email already exists.': '이미 존재하는 이메일입니다.',
  '이미 등록된 이메일입니다.': '이미 가입된 이메일입니다.',
}

const translateError = (msg) => ERROR_TRANSLATIONS[msg] || msg

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180)

  const [emailError, setEmailError] = useState('')
  const [codeError, setCodeError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const isFormComplete = () => {
    return (
      form.email &&
      form.nickname &&
      form.password &&
      form.confirmPassword &&
      codeVerified
    )
  }

  const handleSendCode = async () => {
    setEmailError('')
    try {
      const response = await api.post('/api/accounts/register/', {
        email: form.email,
        nickname: form.nickname,
        phone: form.phone,
        password: form.password,
        password2: form.confirmPassword,
      })

      toast.success('✅ 회원가입 성공! 이메일로 인증번호를 보냈어요.')
      setCodeSent(true)
      setTimeLeft(180)
    } catch (err) {
      const errorList = Object.values(err.response?.data || {}).flat()
      const translated = errorList.map(translateError).join('\n')
      toast.error(translated)
      setEmailError(translated)
    }
  }

  const handleVerifyCode = async () => {
    try {
      await api.post('/api/accounts/verify-code/', {
        email: form.email,
        code,
      })
      toast.success('✅ 이메일 인증이 완료되었습니다.')
      setCodeVerified(true)
    } catch (err) {
      const msg = err.response?.data?.error || '❌ 인증에 실패했습니다.'
      toast.error(msg)
      setCodeError(msg)
    }
  }

  useEffect(() => {
    if (codeSent && timeLeft > 0 && !codeVerified) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [codeSent, timeLeft, codeVerified])

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0')
    const s = String(sec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <section className="register">
     
      <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

      <div className="sns" style={{marginTop:'16px'}}>
        <h2>간편 회원가입</h2>
        <ul>
          <li className='google-login'>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const idToken = credentialResponse.credential;
              try {
                // 1️⃣ 구글 로그인 요청
                const res = await api.post('/api/accounts/google-login/', {
                  id_token: idToken,
                });

                const { access, refresh } = res.data;

                // 2️⃣ 토큰 저장
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);

                // 3️⃣ 유저 정보 가져오기 (Authorization 수동 설정)
                const meRes = await api.get('/api/accounts/me/', {
                  headers: {
                    Authorization: `Bearer ${access}`,
                  },
                });

                // 4️⃣ Redux 저장
                dispatch(loginSuccess({
                  user: meRes.data,
                  access,
                  refresh,
                }));

                toast.success('✅ 구글 로그인 성공!');

                // 5️⃣ 이동
                if (meRes.data.role === 'admin' || meRes.data.is_staff) {
                  navigate('/admin');
                } else {
                  navigate('/dashboard');
                }

              } catch (err) {
                console.error('❌ 구글 로그인 실패:', err);
                toast.error('❌ 구글 로그인 실패!');
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
      </div>{/*SNS로그인 닫음*/}

      <div className='border-wrap'>
          <form className="">
            <label htmlFor="nickname" className={`floating-label ${form.nickname ? 'active':''}`}>
                <span>닉네임</span>
                <input
                  id='nickname'
                  type="text"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  required
                />
            </label>
            <label htmlFor="password" className={`floating-label ${form.password ? 'active':''}`}>
              <span>패스워드</span>
              <input
                id='password'
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
            <label htmlFor="confirmPassword" className={`floating-label ${form.confirmPassword ? 'active':''}`}>
              <span>패스워드 확인</span>  
              <input
                id='confirmPassword'
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
            <div className='input-wrap'>
              <label htmlFor="email" className={`floating-label ${form.email ? 'active':''}`}>
                <span>이메일</span>
                  <input
                    id='email'
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={codeSent}
                  >
                    전송
                </button>
              </div>

              {codeSent && (
              <div className="verify-wrap">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">이메일로 전송된 인증번호</span>
                <span className="text-sm text-gray-500 font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className='input-wrap'>
                <label htmlFor="code" className={`floating-label ${code ? 'active':''}`}>
                  <span>인증번호 (6자리)</span>
                  <input
                    id='code'
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
  
                <button
                  type='button'
                  onClick={handleVerifyCode}
                  className="verify-code"
                >
                  인증 확인
                </button>
              </div>
              {codeError && <p className="text-red-500 text-sm mt-1">{codeError}</p>}
            </div>// .verify-wrap 닫음
            )}
            <label htmlFor='phone' className={`floating-label ${form.phone ? 'active':''}`}>
              <span>휴대전화 번호(선택)</span>
              <input
                id='phone'
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>
            <button
              type='button'
              disabled={!isFormComplete()}
              onClick={() => navigate('/login')}
              className={` w-full py-2 rounded text-white ${isFormComplete() ? 'register-btn' : 'register-btn inactivated cursor-not-allowed'}`}
            >
              회원가입
            </button>
          </form>
        </div> {/*.border-wrap 닫음*/}
 

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </section>
  )
}

export default RegisterPage
