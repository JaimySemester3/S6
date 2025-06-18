jest.mock('amqplib');
jest.mock('uuid', () => ({ v4: () => 'abc' }));

const amqp = require('amqplib');
const { requestAllTweets } = require('../../middleware/queueConsumer');

describe('requestAllTweets', () => {
  it('should resolve with parsed tweets array', async () => {
    const mockChannel = {
      assertQueue: jest.fn().mockResolvedValue({ queue: 'mockReplyQueue' }),
      consume: jest.fn((queue, cb) => {
        cb({
          content: Buffer.from(JSON.stringify([{ id: 1, text: 'Hello' }])),
          properties: { correlationId: 'abc' },
          fields: { consumerTag: 'tag' },
        });
      }),
      sendToQueue: jest.fn(),
      cancel: jest.fn(),
      close: jest.fn(),
    };

    const mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    };

    amqp.connect.mockResolvedValue(mockConnection);

    const tweets = await requestAllTweets();

    expect(Array.isArray(tweets)).toBe(true);
    expect(tweets.length).toBe(1);
    expect(tweets[0].text).toBe('Hello');
  });
});
