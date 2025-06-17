require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { consumeTweets } = require('./queueConsumer.js');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;


app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/', generalLimiter, routes);

app.listen(PORT, () => {
  console.log(`Timeline Service running at http://localhost:${PORT}`);
  consumeTweets();
});
