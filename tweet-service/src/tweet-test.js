import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ]
};

let token;

export function setup() {
  const domain = __ENV.AUTH0_DOMAIN;
  const clientId = __ENV.AUTH0_CLIENT_ID;
  const clientSecret = __ENV.AUTH0_CLIENT_SECRET;
  const audience = __ENV.AUTH0_AUDIENCE;

  const authRes = http.post(`https://${domain}/oauth/token`, JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    audience: audience,
    grant_type: 'client_credentials'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  const authData = authRes.json();
  token = authData.access_token;
  return { token };
}

export default function (data) {
  const url = 'http://microservices.local/tweets';

  const payload = JSON.stringify({
    text: `Load test tweet at ${new Date().toISOString()}`,
    author: 'jaimy'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    }
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201 or 200': (r) => r.status === 201 || r.status === 200,
  });

  sleep(1);
}
