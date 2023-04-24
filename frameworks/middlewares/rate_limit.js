'use strict';

const rateLimit = require('express-rate-limit');

const defaultOptions = {
  windowMs: 5000,
  max: 2,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.tooManyRequests();
  }
};

module.exports = ({ config }) => {
  const disable = !config.rateLimit;
  const createRateLimit = (options) => {
    if (disable) {
      return (req, res, next) => next();
    }
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
