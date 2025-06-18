const express = require('express');
const checkJwt = require('../middleware/auth');
const { storeConsent, fetchConsent } = require('../controllers/userController');

const router = express.Router();

// Expose /user/health
router.get('/health', (req, res) => {
  res.json({ status: 'User Service OK' });
});

router.use(checkJwt);

// Now all routes are prefixed explicitly
router.get('/consent', fetchConsent); 
router.post('/consent', storeConsent);

module.exports = router;
