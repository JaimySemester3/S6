const express = require('express');
const checkJwt = require('../middleware/auth');
const { getTimelineForUser } = require('./queueConsumer.js');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Timeline Service OK' });
});

router.get('/timeline/:author', checkJwt, (req, res) => {
  const author = req.params.author;

  console.log('Authenticated user:', req.auth);

  const tweets = getTimelineForUser(author);
  res.json({ success: true, data: tweets });
});

module.exports = router;
