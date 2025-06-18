jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { email: 'mock@example.com' };
  next();
});

jest.mock('../../middleware/queueConsumer', () => ({
  requestAllTweets: jest.fn().mockResolvedValue([
    { id: 1, text: 'Mock tweet', author: 'tester@example.com', createdAt: new Date().toISOString() },
  ]),
}));

const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('GET /all', () => {
  it('should return tweets from mocked tweet-service', async () => {
    const res = await request(app)
      .get('/all')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].text).toBe('Mock tweet');
  });

  it('should return 500 if requestAllTweets throws error', async () => {
    const queueConsumer = require('../../middleware/queueConsumer');
    queueConsumer.requestAllTweets.mockRejectedValueOnce(new Error('Simulated failure'));

    const res = await request(app)
      .get('/all')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Internal server error/);
  });

  it('should return 500 if requestAllTweets returns invalid data', async () => {
    const queueConsumer = require('../../middleware/queueConsumer');
    queueConsumer.requestAllTweets.mockResolvedValueOnce('not-an-array');

    const res = await request(app)
      .get('/all')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Invalid response from tweet-service/);
  });
});
