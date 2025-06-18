const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const REQUEST_QUEUE = 'tweet.request';

async function requestAllTweets() {
  console.log('📤 Sending tweet request to tweet-service');
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
      (msg) => {
        if (msg.properties.correlationId !== correlationId) {
          console.warn('⚠️ Skipping unrelated message:', msg.properties.correlationId);
          return;
        }

        clearTimeout(timeout);

        try {
          const parsed = JSON.parse(msg.content.toString());

          console.log('📥 Received response from tweet-service:', parsed);

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