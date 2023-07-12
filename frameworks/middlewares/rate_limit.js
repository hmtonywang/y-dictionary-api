'use strict';

const rateLimit = require('express-rate-limit');

const defaultOptions = {
  windowMs: 5000,
  max: 2,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Enable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.tooManyRequests();
  }
};

module.exports = () => {
  const createRateLimit = (options) => {
    return rateLimit({ ...defaultOptions, ...options });
  };
  const requestsInSeconds = (numOfReq, inSeconds) => {
    return createRateLimit({
      windowMs: inSeconds * 1000,
      max: numOfReq
    });
  };
  return {
    createRateLimit,
    requestsInSeconds
  };
};
