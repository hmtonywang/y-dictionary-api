'use strict';

let redisConfig = 'redis://localhost:6379';

if (process.env.REDIS) {
  try {
    redisConfig = JSON.parse(process.env.REDIS);
  } catch (error) {
    console.warn(error);
    redisConfig = process.env.REDIS;
  }
}

module.exports = redisConfig;
