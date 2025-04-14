import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
      form.phone &&
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

        {/* SNS 로그인 */}
        <div className="flex justify-between mb-6">
          <button className="border px-4 py-2 rounded-md flex items-center gap-2">
            <img src={googleLogo} alt="Google" className="w-5 h-5" /> Google
          </button>
          <button className="border px-4 py-2 rounded-md flex items-center gap-2">
            <img src={naverLogo} alt="Naver" className="w-5 h-5" /> 네이버
          </button>
          <button className="border px-4 py-2 rounded-md flex items-center gap-2">
            <img src={kakaoLogo} alt="Kakao" className="w-5 h-5" /> 카카오
          </button>
        </div>

        <input
          type="text"
          name="nickname"
          placeholder="닉네임"
          value={form.nickname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호 확인"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <div className="flex gap-2 mb-2">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="flex-1 border px-3 py-2 rounded"
            required
          />
          <button
            type="button"
            onClick={handleSendCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
            disabled={codeSent}
          >
            전송
          </button>
        </div>

        {codeSent && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">이메일로 전송된 인증번호</span>
              <span className="text-sm text-gray-500 font-mono">{formatTime(timeLeft)}</span>
            </div>
            <input
              type="text"
              placeholder="인증번호 (6자리)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
            {codeError && <p className="text-red-500 text-sm mt-1">{codeError}</p>}
            <button
              onClick={handleVerifyCode}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              인증 확인
            </button>
          </div>
        )}

        <input
          type="text"
          name="phone"
          placeholder="휴대전화 번호"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-4"
          required
        />

        <button
          disabled={!isFormComplete()}
          onClick={() => navigate('/login')}
          className={`w-full py-2 rounded text-white ${isFormComplete() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          로그인 하러가기
        </button>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default RegisterPage
