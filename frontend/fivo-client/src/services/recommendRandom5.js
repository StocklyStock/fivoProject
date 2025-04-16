import axios from "axios";

export const fetchRecommendedStocks = async () => {
  const response = await axios.get("/api/stocks/aiRecommendRandom5/");
  return response.data;
};
