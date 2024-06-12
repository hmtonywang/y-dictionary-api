'use strict';

let redisConfig = 'redis://localhost:6379';

if (process.env.REDIS) {
  try {
    redisConfig = JSON.parse(process.env.REDIS);
  } catch (error) {
    console.warn('Parse JSON process.env.REDIS error', error);
    redisConfig = process.env.REDIS;
  }
}

module.exports = redisConfig;
