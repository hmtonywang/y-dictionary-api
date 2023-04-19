'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../../config');

const defaultOptions = {
  windowMs: 5000,
  max: 2,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.failTooManyRequests();
  }
};

const createRateLimit = (options) => {
  if (!config.rateLimit) {
    return (req, res, next) => next();
  }
  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = createRateLimit;
module.exports.requestsInSeconds = (numOfReq, inSeconds) => {
  return createRateLimit({
    windowMs: inSeconds * 1000,
    max: numOfReq
  });
};
