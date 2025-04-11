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
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = env.VITE_ENV === 'production';

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
