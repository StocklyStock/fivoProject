import axiosInstance from "../utils/axiosInstance";

export const fetchUserRecommendedStocks = async () => {
  const response = await axiosInstance.get("/stocks/user/userRecommendations/");
  return response.data;
};
