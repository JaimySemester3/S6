const express = require('express');
const { getTimelineForUser } = require('./queueConsumer');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Timeline Service OK' });
});

router.get('/timeline/:author', (req, res) => {
  const author = req.params.author;
  const tweets = getTimelineForUser(author);
  res.json({ success: true, data: tweets });
});

module.exports = router;
