require('dotenv').config();
const express = require('express');
const routes = require('./routes');

const app = express();

app.use('/', routes);

app.listen(5000, () => {
  console.log('API Gateway running on http://localhost:5000');
});
