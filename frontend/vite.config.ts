import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/curriculum-configurations": {
        target: "https://trustdash.replit.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/curriculum-configurations/, "/api/configurations"),
      },
    },
  },
})
