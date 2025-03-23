const express = require('express');
const {
  getAllTweets,
  createTweet,
  getTweetById,
  deleteTweet,
} = require('../controllers/tweetController');

const router = express.Router();

router.get('/', getAllTweets);
router.post('/', createTweet);
router.get('/:id', getTweetById);
router.delete('/:id', deleteTweet);

module.exports = router;
