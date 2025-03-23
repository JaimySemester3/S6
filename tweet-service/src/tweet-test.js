import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
      ]
  };

export default function () {
  const url = 'http://localhost:3000/tweets';

  const payload = JSON.stringify({
    text: `Load test tweet at ${new Date().toISOString()}`,
    author: 'k6-loadtester',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
