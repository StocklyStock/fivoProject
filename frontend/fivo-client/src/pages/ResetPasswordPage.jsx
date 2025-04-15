// 📄 src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../services/user"; // 👉 직접 만든 axios 함수
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSendCode = async () => {
    setError("");
    try {
      await sendResetCode(email);
      toast.success("📨 이메일로 인증번호를 전송했습니다!");
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.error || "이메일 전송 실패");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    try {
      await verifyResetCode(email, code);
      toast.success("✅ 인증에 성공했습니다!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ 인증 실패");
    }
  };
  

  const handleResetPassword = async () => {
    setError("");
    try {
      await resetPassword(email, newPassword, newPassword2);
      toast.success("🔐 비밀번호가 성공적으로 변경되었습니다!");
      navigate("/login");
    } catch (err) {
      const res = err.response?.data;
      toast.error(
        res?.new_password2 ||
          res?.error ||
          "❌ 비밀번호 재설정 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Typography variant="h5" gutterBottom>
          🔐 비밀번호 재설정
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 0 && (
          <>
            <TextField
              fullWidth
              label="이메일"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSendCode}
            >
              인증코드 받기
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <TextField
              fullWidth
              label="인증코드"
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleVerifyCode}
            >
              인증하기
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              fullWidth
              label="새 비밀번호"
              type="password"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              fullWidth
              label="비밀번호 확인"
              type="password"
              margin="normal"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleResetPassword}
            >
              비밀번호 재설정
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
