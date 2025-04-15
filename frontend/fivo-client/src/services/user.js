import api from './api'; // 너가 쓰는 axios 인스턴스

export const getCurrentUser = () => api.get('/api/accounts/me/');
export const updateUserInfo = (data) => api.put('/api/accounts/me/update/', data);
export const deleteAccount = () => api.delete('/api/accounts/me/delete/');

export const sendResetCode = (email) =>
  api.post('/api/accounts/send-reset-code/', { email });

export const verifyResetCode = (email, code) =>
  api.post('/api/accounts/verify-code/', {
    email,
    code,
    purpose: 'reset',
  });

export const resetPassword = (email, new_password, new_password2) =>
  api.post('/api/accounts/reset-password/', {
    email,
    new_password,
    new_password2,
  });
