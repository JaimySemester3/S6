const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function publishTweetEvent(tweet) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'new_tweets';

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(tweet)), {
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
