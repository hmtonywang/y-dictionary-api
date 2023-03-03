'use strict';

const defaultRateLimitConfig = {
  windowMs: 3 * 1000, // 3 seconds
  max: 2, // Limit each IP to 2 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

const config = {
  env: process.env.NODE_ENV,
  proxyNumber: 0,
  port: 80,
  logger: {
    
  },
  rateLimit: {
    api: {
      enable: true,
      options: {
        ...defaultRateLimitConfig,
        message: { error: 'Too many requests, please try again later.' },
      },
    },
  },
};

module.exports = config;