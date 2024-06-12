'use strict';

const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

module.exports = function redisRateLimitService ({
  redisRepositoryInterface,
  redisRepositoryImpl,
  redisClient
}) {
  const redisRateLimitRepository = redisRepositoryInterface(redisRepositoryImpl(redisClient));
  const createRateLimiter = (options) => {
    const configuration = {
      ...options,
      prefix: 'rate_limit:',
      store: new RedisStore({
        sendCommand: (command, ...args) =>
          redisRateLimitRepository.sendCommand(command, ...args)
      })
    };
    return rateLimit(configuration);
  };
  return {
    createRateLimiter
  };
};
