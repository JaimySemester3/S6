import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tweets': 'http://microservices.local',
      '/timeline': 'http://microservices.local',
    }
  }
})