'use strict';

module.exports = function connection ({ Redis, config, logger }) {
  const createRedisClient = function createRedisClient () {
    const redisClient = new Redis(config.url);
    redisClient.on('connect', () => logger.info('Connection to redis has been established'));
    redisClient.on('error', (error) => logger.error({ error }, 'redis error'));
    redisClient.on('close', () => logger.info('Connection to redis has been closed'));
    return redisClient;
  };
  return {
    createRedisClient
  };
};
