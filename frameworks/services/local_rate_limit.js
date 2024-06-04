'use strict';

const { rateLimit } = require('express-rate-limit');

module.exports = function localRateLimitService () {
  const createRateLimiter = (options) => {
    return rateLimit(options);
  };
  return {
    createRateLimiter
  };
};
