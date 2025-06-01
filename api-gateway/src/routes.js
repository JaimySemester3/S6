const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const router = express.Router();

console.log('Loaded ENV URLs:');
console.log(' - TWEET_SERVICE_URL:', process.env.TWEET_SERVICE_URL);
console.log(' - TIMELINE_SERVICE_URL:', process.env.TIMELINE_SERVICE_URL);

router.use((req, res, next) => {
  console.log('Incoming request to gateway:', req.method, req.originalUrl);
  next();
});

router.use(
  '/',
  createProxyMiddleware({
    router: (req) => {
      if (req.url.startsWith('/tweets')) {
        console.log('Routing to Tweet Service');
        return process.env.TWEET_SERVICE_URL;
      }
      if (req.url.startsWith('/timeline')) {
        console.log('Routing to Timeline Service');
        return process.env.TIMELINE_SERVICE_URL;
      }
    },
    pathRewrite: (path) => {
      console.log('Rewriting path:', path);
      return path;
    },
    target: 'http://fallback',
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req) => {
      console.log('[ProxyReq] Forwarding:', req.method, req.url);
    }
  })
);


router.get('/health', (req, res) => {
  res.json({ status: 'API Gateway OK' });
});

module.exports = router;
