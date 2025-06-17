const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const tweetRoutes = require('./routes/tweetRoutes');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('Tweet service got request:', req.method, req.originalUrl);
  next();
});

const tweetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
  },
  standardHeaders: true, 
  legacyHeaders: false,  
});

app.use('/tweets', tweetLimiter, tweetRoutes);

module.exports = app;
