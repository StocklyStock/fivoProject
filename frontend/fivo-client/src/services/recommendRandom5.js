import axios from "axios";

export const fetchRecommendedStocks = async () => {
  const response = await axios.get("/api/stocks/random/aiRecommendRandom5/");
  return response.data;
};
