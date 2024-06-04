'use strict';

const { TooManyRequests } = require('http-errors');

module.exports = function rateLimitMiddleware ({
  rateLimitInterface,
  rateLimitImpl,
  config
}) {
  const options = {
    ...config,
    handler: (req, res, next, options) => {
      return next(TooManyRequests());
    }
  };
  const rateLimitService = rateLimitInterface(rateLimitImpl);
  return rateLimitService.createRateLimiter(options);
};
