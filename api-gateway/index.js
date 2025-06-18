require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const checkJwt = require('./middleware/auth');

const app = express();

// Define open (unauthenticated) paths
const openPaths = [
  { path: '/tweets/health', method: 'GET' },
  { path: '/timeline/health', method: 'GET' },
  { path: '/user/health', method: 'GET' }
];

// Global auth guard with exceptions
app.use((req, res, next) => {
  const match = openPaths.find(route => req.path === route.path && req.method === route.method);
  if (match) return next(); // allow health checks
  return checkJwt(req, res, next); // enforce auth for others
});

// ------------------ Proxy routes ------------------

// 🟦 Tweet Service (mounted under /tweets in its own app, so no rewrite)
app.use('/tweets', createProxyMiddleware({
  target: 'http://tweet-service:3000',
  changeOrigin: true,
  pathRewrite: {}, // Don't strip /tweets
  onProxyReq: (proxyReq, req) => {
    if (req.headers['authorization']) {
      proxyReq.setHeader('Authorization', req.headers['authorization']);
    }
  }
}));

// 🟩 Timeline Service (not mounted under a prefix — needs rewrite)
app.use('/timeline', createProxyMiddleware({
  target: 'http://timeline-service:4000',
  changeOrigin: true,
  pathRewrite: { '^/timeline': '' }, // Strip /timeline
  onProxyReq: (proxyReq, req) => {
    if (req.headers['authorization']) {
      proxyReq.setHeader('Authorization', req.headers['authorization']);
    }
  }
}));

// 🟨 User Service (mounted under /user in app, so no rewrite)
app.use('/user', createProxyMiddleware({
  target: 'http://user-service:3002',
  changeOrigin: true,
  pathRewrite: {}, // Don't strip /user
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
