require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.TWEET_QUEUE || 'new_tweets';

let timeline = [];

async function consumeTweets() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Listening for tweets in queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const tweet = JSON.parse(msg.content.toString());
        console.log('Received tweet:', tweet);
        timeline.push(tweet);

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error consuming tweets:', err);
  }
}

function getTimelineForUser(author) {
  return timeline.filter((t) => t.author === author);
}

module.exports = { consumeTweets, getTimelineForUser };
