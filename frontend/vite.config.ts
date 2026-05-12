import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite設定
 *
 * ポート変更方法（フロントエンド）:
 *   下記の server.port を変更するか、起動時に --port オプションを使用
 *   例: npm run dev -- --port 4000
 *
 * バックエンドのポートが変わった場合:
 *   下記の proxy の target を変更
 *   例: target: 'http://localhost:9000'
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
