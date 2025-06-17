const express = require('express');
const checkJwt = require('../middleware/auth');
const {
  validateTweet,
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
} = require('../controllers/tweetController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Tweet Service OK' });
});
router.use(checkJwt);

router.post('/', validateTweet, createTweet);
router.get('/', getAllTweets);
router.get('/:id', getTweetById);
router.delete('/:id', deleteTweet);

module.exports = router;
