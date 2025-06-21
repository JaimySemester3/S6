jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  }));
});

const prisma = require('../src/prismaClient');
const { publishTweetEvent } = require('../src/rabbitmqProducer');
const {
  createTweet,
  getAllTweets,
  getMyTweets,
  deleteTweet,
  deleteAllTweetsByUser,
} = require('../src/controllers/tweetController');

jest.mock('../src/rabbitmqProducer', () => ({
  publishTweetEvent: jest.fn(),
}));

prisma.tweet = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('createTweet', () => {
  it('should create tweet and return 201', async () => {
    const req = {
      body: { text: 'Test tweet' },
      auth: { 'https://yourapp.com/email': 'test@example.com' },
    };
    const res = mockRes();

    const fakeTweet = { id: 1, text: 'Test tweet', author: 'test@example.com' };
    prisma.tweet.create.mockResolvedValue(fakeTweet);

    await createTweet(req, res);

    expect(prisma.tweet.create).toHaveBeenCalledWith({
      data: { text: 'Test tweet', author: 'test@example.com' },
    });
    expect(publishTweetEvent).toHaveBeenCalledWith(fakeTweet);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeTweet });
  });
});

describe('getAllTweets', () => {
  it('should return all tweets', async () => {
    const req = {};
    const res = mockRes();

    const tweets = [
      { id: 1, text: 'Tweet 1', author: 'a@example.com' },
      { id: 2, text: 'Tweet 2', author: 'b@example.com' },
    ];
    prisma.tweet.findMany.mockResolvedValue(tweets);

    await getAllTweets(req, res);

    expect(prisma.tweet.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: tweets });
  });
});

describe('getMyTweets', () => {
  it('should return user\'s tweets', async () => {
    const req = {
      auth: { 'https://yourapp.com/email': 'me@example.com' },
    };
    const res = mockRes();

    const userTweets = [
      { id: 1, text: 'My Tweet', author: 'me@example.com' },
    ];
    prisma.tweet.findMany.mockResolvedValue(userTweets);

    await getMyTweets(req, res);

    expect(prisma.tweet.findMany).toHaveBeenCalledWith({
      where: { author: 'me@example.com' },
      orderBy: { createdAt: 'desc' },
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: userTweets });
  });
});

describe('deleteTweet', () => {
  it('should delete tweet if user is owner', async () => {
    const req = {
      params: { id: '1' },
      user: { 'https://yourapp.com/email': 'owner@example.com' },
    };
    const res = mockRes();

    const tweet = { id: 1, text: 'Owned tweet', author: 'owner@example.com' };
    prisma.tweet.findUnique.mockResolvedValue(tweet);
    prisma.tweet.delete.mockResolvedValue(tweet);

    await deleteTweet(req, res);

    expect(prisma.tweet.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.tweet.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: tweet });
  });

  it('should return 403 if user is not the tweet owner', async () => {
    const req = {
      params: { id: '1' },
      user: { 'https://yourapp.com/email': 'other@example.com' },
    };
    const res = mockRes();

    const tweet = { id: 1, text: 'Owned tweet', author: 'owner@example.com' };
    prisma.tweet.findUnique.mockResolvedValue(tweet);

    await deleteTweet(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden: Not the tweet owner',
    });
  });

  it('should return 404 if tweet not found', async () => {
    const req = {
      params: { id: '999' },
      user: { 'https://yourapp.com/email': 'anyone@example.com' },
    };
    const res = mockRes();

    prisma.tweet.findUnique.mockResolvedValue(null);

    await deleteTweet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Tweet not found',
    });
  });
});

describe('deleteAllTweetsByUser', () => {
  it('should delete tweets by user and return count', async () => {
    const req = {
      auth: { 'https://yourapp.com/email': 'user@example.com' },
    };
    const res = mockRes();

    prisma.tweet.deleteMany.mockResolvedValue({ count: 3 });

    await deleteAllTweetsByUser(req, res);

    expect(prisma.tweet.deleteMany).toHaveBeenCalledWith({
      where: { author: 'user@example.com' },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      deletedCount: 3,
    });
  });

  it('should return 400 if email is missing', async () => {
    const req = { auth: {} }; 
    const res = mockRes();

    await deleteAllTweetsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Missing user email',
    });
  });

  it('should return 500 if Prisma throws error', async () => {
    const req = {
      auth: { 'https://yourapp.com/email': 'user@example.com' },
    };
    const res = mockRes();

    prisma.tweet.deleteMany.mockRejectedValue(new Error('Database error'));

    await deleteAllTweetsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Internal server error',
        error: 'Database error',
      })
    );
  });
});
