const Redis = require('ioredis');
const redis = new Redis('redis://redis-master.default.svc.cluster.local:6379');

module.exports = redis;
