const prisma = require('../prismaClient');
const { publishTweetEvent } = require('../rabbitmqProducer');

// POST /tweets
async function createTweet(req, res) {
  try {
    const email = req.auth?.['https://yourapp.com/email'];
    const { text } = req.body;

    if (!text || !email) {
      console.warn('⚠️ Missing text or user email:', { text, email });
      return res.status(400).json({ success: false, message: 'Missing text or user email' });
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

module.exports = {
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
};
