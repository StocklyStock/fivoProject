import api from './api'; // 너가 쓰는 axios 인스턴스

export const getCurrentUser = () => api.get('/api/accounts/me/');
export const updateUserInfo = (data) => api.put('/api/accounts/me/update/', data);
export const deleteAccount = () => api.delete('/api/accounts/me/delete/');