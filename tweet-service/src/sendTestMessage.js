const amqp = require('amqplib');

(async function sendTestMessage() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('tweet_queue', { durable: true });

    const testTweet = { text: "rabbitmq test", author: "Jaimy" };
    channel.sendToQueue('tweet_queue', Buffer.from(JSON.stringify(testTweet)), {
      persistent: true,
    });

    console.log('Sent test tweet:', testTweet);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Error sending test message:', error);
  }
})();
