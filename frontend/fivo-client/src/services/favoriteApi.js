import api from './api'; // 이건 토큰 포함된 axios 인스턴스

// 즐겨찾기 추가
export const addFavorite = async ({ stock_code, stock_name }) => {
  return await api.post('/api/favorites/', { stock_code, stock_name });
};

// 즐겨찾기 삭제
export const removeFavorite = async (stock_code) => {
  return await api.delete('/api/favorites/', {
    params: { stock_code },
  });
};

// 즐겨찾기 목록
export const getFavorites = async () => {
  const res = await api.get('/api/favorites/');
  return res.data;
};
