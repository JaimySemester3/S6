const express = require('express');
const {
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
} = require('../controllers/tweetController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Tweet Service OK' });
});

router.post('/', createTweet);
router.get('/', getAllTweets);
router.get('/:id', getTweetById);
router.delete('/:id', deleteTweet);

module.exports = router;
