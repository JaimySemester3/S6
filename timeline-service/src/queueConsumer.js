require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.TWEET_QUEUE || 'new_tweets';

let timeline = [];

async function consumeTweets() {
  const maxRetries = 10;
  const retryDelay = 2000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1}: Connecting to RabbitMQ at ${RABBITMQ_URL}`);
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, { durable: true });

      console.log(`Connected. Listening for tweets in queue: ${QUEUE_NAME}`);

      channel.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
          try {
            const tweet = JSON.parse(msg.content.toString());
            console.log('Received tweet:', tweet);
            timeline.push(tweet);
            channel.ack(msg);
          } catch (err) {
            console.error('Error processing message:', err);
          }
        }
      });

      return;
    } catch (err) {
      console.error(`Error connecting to RabbitMQ (attempt ${attempt + 1}):`, err.message);
      attempt++;
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }

  console.error('Failed to connect to RabbitMQ after multiple attempts.');
}

function getTimelineForUser(author) {
  return timeline.filter((t) => t.author === author);
}

module.exports = { consumeTweets, getTimelineForUser };
