'use strict';

module.exports = process.env.REDIS
  ? JSON.parse(process.env.REDIS)
  : 'redis://localhost:6379';
