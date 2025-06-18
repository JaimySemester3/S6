const axios = require('axios');

async function getAccessToken() {
  const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_MGMT_AUDIENCE,
    grant_type: 'client_credentials',
  });

  return response.data.access_token;
}

async function updateUserConsent(userId) {
  const token = await getAccessToken();

  await axios.patch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
    {
      user_metadata: {
        gdpr_consent: {
          accepted: true,
          timestamp: new Date().toISOString(),
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

async function getUserConsent(userId) {
  const token = await getAccessToken();

  const response = await axios.get(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.user_metadata?.gdpr_consent || null;
}


module.exports = {
  updateUserConsent,
  getUserConsent,
};
