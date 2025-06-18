const prisma = require('../prismaClient');
const { publishTweetEvent } = require('../rabbitmqProducer');
const { body, validationResult } = require('express-validator');

const validateTweet = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 280 })
    .withMessage('Tweet must be between 1 and 280 characters'),
];
// POST /tweets
async function createTweet(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const email = req.auth?.['https://yourapp.com/email'];
    const { text } = req.body;

    if (!email) {
      console.warn('⚠️ Missing user email:', { email });
      return res.status(400).json({ success: false, message: 'Missing user email' });
    }

    const newTweet = await prisma.tweet.create({
      data: { text, author: email },
    });

    console.log('✅ New tweet created:', newTweet);

    await publishTweetEvent(newTweet);

    res.status(201).json({ success: true, data: newTweet });
  } catch (err) {
    console.error('❌ Error in createTweet:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// GET /tweets
async function getAllTweets(req, res) {
  const tweets = await prisma.tweet.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: tweets });
}

// GET /tweets/:id
async function getTweetById(req, res) {
  const tweet = await prisma.tweet.findUnique({
    where: { id: parseInt(req.params.id, 10) },
  });

  if (!tweet) {
    return res.status(404).json({ success: false, message: 'Tweet not found' });
  }

  res.json({ success: true, data: tweet });
}

async function getMyTweets(req, res) {
  try {
    const email = req.auth?.['https://yourapp.com/email'];

    if (!email) {
      return res.status(401).json({ success: false, message: 'Unauthorized: email not found' });
    }

    const tweets = await prisma.tweet.findMany({
      where: { author: email },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tweets });
  } catch (err) {
    console.error('❌ Error in getMyTweets:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// DELETE /tweets/:id
async function deleteTweet(req, res) {
  try {
    const tweetId = parseInt(req.params.id, 10);
    const email = req.user?.['https://yourapp.com/email'];

    const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });

    if (!tweet) {
      return res.status(404).json({ success: false, message: 'Tweet not found' });
    }

    if (tweet.author !== email) {
      return res.status(403).json({ success: false, message: 'Forbidden: Not the tweet owner' });
    }

    const deleted = await prisma.tweet.delete({ where: { id: tweetId } });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteAllTweetsByUser(req, res) {
  try {
    const email = req.auth?.['https://yourapp.com/email'];
    console.log('📨 Email extracted for deletion:', email);

    if (!email) {
      console.warn('⚠️ Missing email in JWT payload');
      return res.status(400).json({ success: false, message: 'Missing user email' });
    }

    const deleted = await prisma.tweet.deleteMany({
      where: { author: email },
    });

    console.log('🗑️ Deleted tweets count:', deleted.count);

    res.json({ success: true, deletedCount: deleted.count });
  } catch (err) {
    console.error('❌ Error deleting user tweets:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
}

module.exports = {
  validateTweet,
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
  getMyTweets,
  deleteAllTweetsByUser,
};
