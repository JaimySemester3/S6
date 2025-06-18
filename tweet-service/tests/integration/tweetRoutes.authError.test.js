jest.mock('../../src/middleware/auth', () => (req, res, next) => {
  req.auth = {}; // Simulate missing email
  next();
});

const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/prismaClient');

prisma.tweet = {
  deleteMany: jest.fn(),
};

describe('DELETE / (missing email)', () => {
  it('should return 400 if email is missing from JWT', async () => {
    const res = await request(app)
      .delete('/')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Missing user email');
  });
});
