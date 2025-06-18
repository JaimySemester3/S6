const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('User service got request:', req.method, req.originalUrl);
  next();
});

const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests. Please wait a bit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/', userLimiter, userRoutes);

module.exports = app;
