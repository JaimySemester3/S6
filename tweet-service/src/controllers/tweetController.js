const prisma = require('../prismaClient');
const { publishTweetEvent } = require('../rabbitmqProducer');

async function createTweet(req, res) {
  const { text, author } = req.body;

  if (!text || !author) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const newTweet = await prisma.tweet.create({
    data: { text, author },
  });

  await publishTweetEvent(newTweet);

  res.status(201).json({ success: true, data: newTweet });
}

async function getAllTweets(req, res) {
  const tweets = await prisma.tweet.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: tweets });
}

async function getTweetById(req, res) {
  const tweet = await prisma.tweet.findUnique({
    where: { id: parseInt(req.params.id, 10) },
  });

  if (!tweet) {
    return res.status(404).json({ success: false, message: 'Tweet not found' });
  }

  res.json({ success: true, data: tweet });
}

async function deleteTweet(req, res) {
  try {
    const deleted = await prisma.tweet.delete({
      where: { id: parseInt(req.params.id, 10) },
    });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Tweet not found' });
  }
}

module.exports = {
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
};
