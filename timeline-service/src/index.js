require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(helmet());

const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { success: false, message: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/', generalLimiter, routes);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅ Timeline Service running at http://localhost:${PORT}`);
  });
}

module.exports = app;