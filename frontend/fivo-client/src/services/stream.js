// 📄 src/services/stream.js
import axios from 'axios'

const fastApi = axios.create({
  baseURL:
    import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_FASTAPI_URL_PROD
      : import.meta.env.VITE_FASTAPI_URL_DEV,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default fastApi
