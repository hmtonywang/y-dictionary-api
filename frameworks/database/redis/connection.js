'use strict';

module.exports = function connection ({ Redis, url, logger }) {
  function createRedisClient () {
    return new Promise((resolve, reject) => {
      const redisClient = new Redis(url);
      redisClient.on('ready', () => {
        logger.info('Connection to redis is ready');
        return resolve(redisClient);
      });
      redisClient.on('error', (error) => {
        logger.error({ error }, 'redis error');
        redisClient.disconnect();
        return reject(error);
      });
      redisClient.on('close', () => {
        logger.info('Connection to redis has been closed');
        redisClient.disconnect();
      });
    });
  };
  return {
    createRedisClient
  };
};
