const express = require('express');
const checkJwt = require('../middleware/auth');
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
router.use(checkJwt);

router.post('/', createTweet);
router.get('/', getAllTweets);
router.get('/:id', getTweetById);
router.delete('/:id', deleteTweet);

module.exports = router;
