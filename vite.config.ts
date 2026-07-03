import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Electron 빌드는 ELECTRON=1 환경변수와 함께 별도로 실행 (electron:dev/build 스크립트)
export default defineConfig({
  plugins: [react()],
})
