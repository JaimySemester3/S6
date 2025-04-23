require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const { consumeTweets } = require('./queueConsumer.js');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Timeline Service running at http://localhost:${PORT}`);
  consumeTweets();
});
