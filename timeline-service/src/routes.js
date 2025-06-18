const express = require('express');
const checkJwt = require('../middleware/auth');
const { requestAllTweets } = require('../middleware/queueConsumer');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Timeline Service OK' });
});

router.get('/.well-known/acme-challenge/:token', (req, res) => {
  res.status(200).send('ACME challenge path ready');
});

router.get('/all', checkJwt, async (req, res) => {
  try {
    console.log('⚙️  /timeline/all called');

    const tweets = await requestAllTweets();
    console.log('✅ Fetched tweets:', Array.isArray(tweets), tweets.length);

    if (!Array.isArray(tweets)) {
      console.warn('❗ Invalid tweets payload:', tweets);
      return res.status(500).json({ success: false, message: 'Invalid response from tweet-service' });
    }

    const result = { success: true, data: tweets };
    console.log('📤 Sending response to client:', JSON.stringify(result).slice(0, 200));

    return res.json(result);
  } catch (err) {
    console.error('❌ Error in /timeline/all route:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
