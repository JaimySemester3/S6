const express = require('express');
const checkJwt = require('../middleware/auth');
const {
  validateTweet,
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
  getMyTweets,
  deleteAllTweetsByUser,
} = require('../controllers/tweetController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Tweet Service OK' });
});

router.get('/.well-known/acme-challenge/:token', (req, res) => {
  res.status(200).send('ACME challenge passthrough');
});

router.use(checkJwt);

router.post('/', validateTweet, createTweet);
router.get('/me', getMyTweets);
router.delete('/', deleteAllTweetsByUser);
router.get('/', getAllTweets);
router.get('/:id', getTweetById);
router.delete('/:id', deleteTweet);

module.exports = router;
