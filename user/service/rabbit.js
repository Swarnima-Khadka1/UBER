//setup rabbitmq connection
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL 
let connection, channel;
let connectionPromise;

async function connectRabbitMQ() {
    if(connectionPromise) return connectionPromise;
    
    connectionPromise = (async () => {
        try {
            connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ', error);
        }
    })();
    
    return connectionPromise;
}

async function subscribeToQueue(queueName, callback) {
    try {
        // Wait for connection if not ready
        if(!channel) {
            await connectRabbitMQ();
        }
        
        await channel.assertQueue(queueName, { durable: true });
        channel.consume(queueName, (message) => {
            if (message !== null) {
                const content = message.content.toString();
                callback(content);
                channel.ack(message);
            }   
        });
    } catch (error) {
        console.error('Failed to subscribe to queue', error);
    }   

}

async function publishToQueue(queueName, message) {
    try {
        // Wait for connection if not ready
        if(!channel) {
            await connectRabbitMQ();
        }
        
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(message));
    } catch (error) {
        console.error('Failed to publish to queue', error);
    }  
    
}

module.exports = {
    connectRabbitMQ,
    subscribeToQueue,
    publishToQueue
};