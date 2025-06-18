// react-frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      //'/user': 'http://microservices.local',  
      //'/tweets': 'http://microservices.local', 
      //'/timeline': 'http://microservices.local', 

      // '/tweets': 'http://20.13.192.26:3000',    
      // '/timeline': 'http://4.207.239.104:4000' 

      '/user': 'http://20.13.207.138',
      '/tweets': 'http://20.13.207.138',
      '/timeline': 'http://20.13.207.138'
    }
  }
})
