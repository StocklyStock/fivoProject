// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   base: '/', // ✅ 배포 시 필수!
//   plugins: [react()],
//   server: {
//     host: "0.0.0.0",
//     port: 5173,
//     proxy: {
//       "/api": {
//         target: "http://django:8000",
//         changeOrigin: true,
//         secure: false,
//       },
//       "/stream": {
//         target: "http://fastapi:8001",
//         changeOrigin: true,
//         secure: false,
//         ws: true,
//       },
//     },
//   },
// });
import { defineConfig, loadEnv } from 'vite';
import path from 'node:path'; // ✅ 고친 부분
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // ✅ .env 위치 강제 지정 → fivo_h 디렉토리
  const envDir = path.resolve(__dirname, '../../');
  const env = loadEnv(mode, envDir); // 강제로 루트의 .env 로드
  const isProd = env.VITE_ENV === 'production';

  // console.log("📁 process.cwd():", process.cwd());
  // console.log("📄 loading env from:", envDir);
  // console.log("🌱 VITE_API_URL_DEV:", env.VITE_API_URL_DEV);

  const apiUrl = isProd ? env.VITE_API_URL_PROD : env.VITE_API_URL_DEV;
  const streamUrl = isProd ? env.VITE_FASTAPI_URL_PROD : env.VITE_FASTAPI_URL_DEV;
  return {
    base: '/',
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/stream': {
          target: streamUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
// target : "http://localhost:8080", // 일단 연결이 안되서 임시로