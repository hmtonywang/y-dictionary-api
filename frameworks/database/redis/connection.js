'use strict';

module.exports = function connection ({ Redis, config, logger }) {
  function createRedisClient () {
    return new Promise((resolve, reject) => {
      const options = {
        ...config,
        enableReadyCheck: true
      };
      const redisClient = new Redis(options);
      redisClient.on('ready', () => {
        logger.info('Connection to redis is ready');
        return resolve(redisClient);
      });
      redisClient.on('error', (error) => {
        logger.error({ error }, 'redis error');
        return reject(error);
      });
      redisClient.on('close', () => {
        logger.info('Connection to redis has been closed');
      });
    });
  };
  return {
    createRedisClient
  };
};
