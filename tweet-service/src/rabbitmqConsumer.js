const amqp = require('amqplib');
const prisma = require('./prismaClient');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const REQUEST_QUEUE = 'tweet.request';

async function startTweetConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(REQUEST_QUEUE, { durable: false });

  channel.consume(REQUEST_QUEUE, async (msg) => {
    const request = JSON.parse(msg.content.toString());
    console.log('📨 Received request on tweet.request:', request);

    if (request.action === 'getAllTweets') {
      try {
        const tweets = await prisma.tweet.findMany({
          orderBy: { createdAt: 'desc' },
        });
        console.log('📤 Sending back tweets:', tweets.length);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(tweets)),
          {
            correlationId: msg.properties.correlationId,
          }
        );

        channel.ack(msg);
      } catch (err) {
        console.error('❌ Failed to fetch tweets:', err);
        channel.ack(msg);
      }
    }
  });

  console.log(`✅ tweet-service is listening on ${REQUEST_QUEUE}`);
}

module.exports = { startTweetConsumer };