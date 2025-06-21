jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  }));
});

const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/prismaClient');

jest.mock('../../src/middleware/auth', () => require('../../__mocks__/auth'));
jest.mock('../../src/rabbitmqProducer', () => ({
  publishTweetEvent: jest.fn(),
}));

beforeEach(() => {
  prisma.tweet = {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /', () => {
  it('should return all tweets', async () => {
    const tweets = [
      { id: 1, text: 'Hello', author: 'a@example.com' },
      { id: 2, text: 'World', author: 'b@example.com' },
    ];
    prisma.tweet.findMany.mockResolvedValue(tweets);

    const res = await request(app)
      .get('/')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(tweets);
  });
});

describe('POST /', () => {
  it('should create a tweet and return it', async () => {
    const newTweet = { id: 1, text: 'Integration test tweet', author: 'test@example.com' };
    prisma.tweet.create.mockResolvedValue(newTweet);

    const res = await request(app)
      .post('/')
      .set('Authorization', 'Bearer FAKE_TOKEN')
      .send({ text: 'Integration test tweet' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(newTweet);
  });

  it('should fail validation with empty text', async () => {
    const res = await request(app)
      .post('/')
      .set('Authorization', 'Bearer FAKE_TOKEN')
      .send({ text: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe('GET /me', () => {
  it('should return tweets by authenticated user', async () => {
    const myTweets = [{ id: 1, text: 'My tweet', author: 'test@example.com' }];
    prisma.tweet.findMany.mockResolvedValue(myTweets);

    const res = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(myTweets);
  });
});

describe('DELETE /:id', () => {
  it('should delete the tweet if user is the owner', async () => {
    const tweet = { id: 1, text: 'Owned tweet', author: 'test@example.com' };
    prisma.tweet.findUnique.mockResolvedValue(tweet);
    prisma.tweet.delete.mockResolvedValue(tweet);

    const res = await request(app)
      .delete('/1')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(tweet);
  });

  it('should return 403 if user is not the owner', async () => {
    const tweet = { id: 2, text: 'Not mine', author: 'someone@example.com' };
    prisma.tweet.findUnique.mockResolvedValue(tweet);

    const res = await request(app)
      .delete('/2')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: Not the tweet owner');
  });

  it('should return 404 if tweet is not found', async () => {
    prisma.tweet.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/999')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Tweet not found');
  });
});

describe('DELETE /', () => {
  it('should delete all tweets by the user', async () => {
    prisma.tweet.deleteMany.mockResolvedValue({ count: 2 });

    const res = await request(app)
      .delete('/')
      .set('Authorization', 'Bearer FAKE_TOKEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deletedCount).toBe(2);
  });
});
