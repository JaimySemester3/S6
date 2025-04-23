const prisma = require('../prismaClient');
const { publishTweetEvent } = require('../rabbitmqProducer');

async function createTweet(req, res) {
  try {
    console.log('Received POST /tweets with body:', req.body);

    const { text, author } = req.body;
    if (!text || !author) {
      console.log('Missing fields');
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const newTweet = await prisma.tweet.create({
      data: { text, author },
    });
    console.log('Tweet saved to DB:', newTweet);

    await publishTweetEvent(newTweet);
    console.log('Tweet published to RabbitMQ');

    res.status(201).json({ success: true, data: newTweet });
    console.log('Response sent to client');
  } catch (err) {
    console.error('Error in controller:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
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
