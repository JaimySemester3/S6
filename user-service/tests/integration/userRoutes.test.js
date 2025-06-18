jest.mock('../../src/middleware/auth', () => (req, res, next) => {
  req.auth = { sub: 'auth0|mockuser' };
  next();
});

jest.mock('../../src/services/auth0Client', () => ({
  updateUserConsent: jest.fn().mockResolvedValue(),
  getUserConsent: jest.fn().mockResolvedValue({ accepted: true, timestamp: new Date().toISOString() }),
}));

const request = require('supertest');
const express = require('express');
const userRoutes = require('../../src/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/', userRoutes);

describe('User Routes', () => {
  it('GET /consent - returns user consent', async () => {
    const res = await request(app)
      .get('/consent')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.consent).toHaveProperty('accepted', true);
  });

  it('POST /consent - updates consent', async () => {
    const res = await request(app)
      .post('/consent')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
