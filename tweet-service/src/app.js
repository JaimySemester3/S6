const express = require('express');
const cors = require('cors');

const tweetRoutes = require('./routes/tweetRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/tweets', tweetRoutes);

module.exports = app;
