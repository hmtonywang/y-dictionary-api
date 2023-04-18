'use strict';

module.exports.env = process.env.NODE_ENV || 'development';
module.exports.port = process.env.PORT || 80;
module.exports.proxyNumber = process.env.PROXY_NUMBER || 1;
module.exports.version = process.env.VERSION || 'v1';
module.exports.rateLimit = process.env.RATE_LIMIT !== 'false';
module.exports.auth = {
  apiKey: process.env.AUTH_API_KEY || 'api-key',
  expiry: process.env.AUTH_EXPIRY || 5,
};