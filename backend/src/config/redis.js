
const { createClient }  = require('redis');
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_KEY ?.trim(),
    socket: {
        // host:  process.env.REDIS_HOST?.trim(),
        host: 'redis-11470.c17.us-east-1-4.ec2.cloud.redislabs.com',
        // port:  process.env.REDIS_PORT?.trim()
        port: 11470
    }
});

 module.exports = redisClient;

