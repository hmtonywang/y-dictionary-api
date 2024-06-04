'use strict';

module.exports = function redisRateLimitService (service) {
  if (typeof service.createRateLimiter !== 'function') throw new TypeError('Input service must implement the "createRateLimiter" function');
  const createRateLimiter = (options) => {
    return service.createRateLimiter(options);
  };
  return {
    createRateLimiter
  };
};
