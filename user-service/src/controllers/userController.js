const { getUserConsent, updateUserConsent } = require('../services/auth0Client');

async function storeConsent(req, res) {
  const userId = req.auth.sub;

  try {
    await updateUserConsent(userId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error storing consent:', err.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

async function fetchConsent(req, res) {
  const userId = req.auth.sub;

  try {
    const consent = await getUserConsent(userId);
    res.status(200).json({ success: true, consent });
  } catch (err) {
    console.error('❌ Error fetching consent:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch consent' });
  }
}

module.exports = {
  fetchConsent,
  storeConsent,
};
