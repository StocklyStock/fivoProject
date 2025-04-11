import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleVerify = async () => {
    setError('')
    try {
      const res = await api.post('/accounts/verify-code/', { email, code })
      setSuccess(res.data.message)
      alert('✅ 이메일 인증이 완료되었습니다.')

      // 인증 완료 후 로그인
      const loginRes = await api.post('/accounts/login/', { email, password: '사용자가 입력한 비밀번호' })  // 적절한 비밀번호로 로그인 요청
      console.log('로그인 성공', loginRes.data)

      // 로그인 후 대시보드 페이지로 이동
      localStorage.setItem('accessToken', loginRes.data.access)  // 토큰 저장
      navigate('/dashboard')  // 대시보드 페이지로 이동
    } catch (err) {
      const msg = err.response?.data?.error || '❌ 인증에 실패했습니다.'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">이메일 인증</h2>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <input
          type="text"
          placeholder="인증번호 입력 (6자리)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          인증번호 확인
        </button>
      </div>
    </div>
  )
}

export default VerifyEmailPage
