const express = require('express');
const checkJwt = require('../middleware/auth');
const { storeConsent, fetchConsent } = require('../controllers/userController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'User Service OK' });
});

router.get('/.well-known/acme-challenge/:token', (req, res) => {
  res.status(200).send('ACME challenge passthrough');
});

router.use(checkJwt);

router.get('/consent', fetchConsent); 
router.post('/consent', storeConsent);

module.exports = router;
