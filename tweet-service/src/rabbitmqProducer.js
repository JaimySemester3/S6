require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.TWEET_QUEUE || 'new_tweets';

async function publishTweetEvent(tweet) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(tweet)), {
      persistent: true,
    });

    console.log('Tweet published to queue');

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (err) {
    console.error('Error publishing tweet:', err);
  }
}

module.exports = { publishTweetEvent };
