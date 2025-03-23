const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Tweet Service running on http://localhost:${PORT}`);
});
