require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.TWEET_QUEUE;

let tweets = [];
let currentId = 1;

async function consumeMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('Waiting for messages in ${QUEUE_NAME}');

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const tweetData = JSON.parse(msg.content.toString());

        const newTweet = {
          id: currentId++,
          text: tweetData.text,
          author: tweetData.author,
          createdAt: new Date().toISOString(),
        };

        tweets.push(newTweet);

        console.log('Tweet saved:', newTweet);

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error consuming messages from RabbitMQ:', error);
  }
}

consumeMessages();
