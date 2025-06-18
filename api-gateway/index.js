require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const checkJwt = require('./middleware/auth');

const app = express();

// ✅ Enable CORS for all routes
app.use(cors({
  origin: '*', // 🔒 In production, use your actual frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔓 Allow Let's Encrypt challenge path unauthenticated
app.use('/.well-known/acme-challenge', express.static('/var/www/html'));

// Define open (unauthenticated) paths
const openPaths = [
  { path: '/tweets/health', method: 'GET' },
  { path: '/timeline/health', method: 'GET' },
  { path: '/user/health', method: 'GET' }
];

// Global auth guard with exceptions
app.use((req, res, next) => {
  if (req.path.startsWith('/.well-known/acme-challenge')) {
    return next(); // Skip JWT auth for ACME challenge
  }

  const match = openPaths.find(route => req.path === route.path && req.method === route.method);
  if (match) return next(); // Allow health checks

  return checkJwt(req, res, next); // Enforce JWT for everything else
});

// ------------------ Proxy routes ------------------

// 🟦 Tweet Service
app.use('/tweets', createProxyMiddleware({
  target: 'http://tweet-service:3000',
  changeOrigin: true,
  pathRewrite: {}, // Preserve /tweets
  onProxyReq: (proxyReq, req) => {
    if (req.headers['authorization']) {
      proxyReq.setHeader('Authorization', req.headers['authorization']);
    }
  }
}));

// 🟩 Timeline Service
app.use('/timeline', createProxyMiddleware({
  target: 'http://timeline-service:4000',
  changeOrigin: true,
  pathRewrite: { '^/timeline': '' }, // Remove /timeline from path
  onProxyReq: (proxyReq, req) => {
    if (req.headers['authorization']) {
      proxyReq.setHeader('Authorization', req.headers['authorization']);
    }
  }
}));

// 🟨 User Service
app.use('/user', createProxyMiddleware({
  target: 'http://user-service:3002',
  changeOrigin: true,
  pathRewrite: {}, // Preserve /user
  onProxyReq: (proxyReq, req) => {
    if (req.headers['authorization']) {
      proxyReq.setHeader('Authorization', req.headers['authorization']);
    }
  }
}));

// --------------------------------------------------

app.listen(8080, () => {
  console.log('🚀 API Gateway running on port 8080');
});
