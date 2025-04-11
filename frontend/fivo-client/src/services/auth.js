// 📄 src/services/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}accounts/login/`, {
      email,
      password,
    });

    if (res.data.access && res.data.user) {
      return {
        success: true,
        message: res.data.message,
        access: res.data.access,
        refresh: res.data.refresh,
        user: res.data.user,
      };
    } else {
      return {
        success: false,
        message: "로그인 실패: 유저 정보가 없습니다.",
      };
    }
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.error ||
        "로그인 실패: 이메일 또는 비밀번호를 확인해주세요.",
    };
  }
};
