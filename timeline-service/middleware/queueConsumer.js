const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const REQUEST_QUEUE = 'tweet.request';

const redis = new Redis({
  host: 'redis-master.default.svc.cluster.local',
  port: 6379,
});

async function requestAllTweets() {
  console.log('📤 Checking Redis cache for timeline');

  const cached = await redis.get('cached:timeline');
  if (cached) {
    console.log('⚡ Returning tweets from Redis cache');
    return JSON.parse(cached);
  }

  console.log('📤 Cache miss — requesting tweets from tweet-service');

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(REQUEST_QUEUE, { durable: false });
  const { queue } = await channel.assertQueue('', { exclusive: true });
  const correlationId = uuidv4();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('⏰ Timeout: No response from tweet-service'));
      channel.close();
      connection.close();
    }, 5000);

    channel.consume(
      queue,
      async (msg) => {
        if (msg.properties.correlationId !== correlationId) return;

        clearTimeout(timeout);

        try {
          const parsed = JSON.parse(msg.content.toString());

          await redis.set('cached:timeline', JSON.stringify(parsed), 'EX', 30);
          console.log('✅ Fetched from tweet-service and cached in Redis');

          resolve(parsed);
        } catch (err) {
          reject(err);
        } finally {
          channel.cancel(msg.fields.consumerTag);
          setTimeout(() => {
            channel.close();
            connection.close();
          }, 500);
        }
      },
      { noAck: true }
    );

    channel.sendToQueue(
      REQUEST_QUEUE,
      Buffer.from(JSON.stringify({ action: 'getAllTweets' })),
      {
        correlationId,
        replyTo: queue,
      }
    );
  });
}

module.exports = { requestAllTweets };
