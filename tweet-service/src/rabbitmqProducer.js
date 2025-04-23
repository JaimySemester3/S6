require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.TWEET_QUEUE || 'new_tweets';

async function publishTweetEvent(tweet) {
  let connection, channel;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    await channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(tweet)),
      { persistent: true }
    );

    console.log('Tweet published to RabbitMQ');
  } catch (err) {
    console.error('Error publishing tweet:', err);
  } finally {
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch (closeErr) {
      console.error('Error closing RabbitMQ connection:', closeErr);
    }
  }
}

module.exports = { publishTweetEvent };
