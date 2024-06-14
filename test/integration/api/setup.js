'use strict';

const supertest = require('supertest');
const { Redis } = require('ioredis');
const { flushAllRedisData } = require('../../utils');
const app = require('../../../app');
const config = require('../../../config');

module.exports = async function setup () {
  const redisClient = new Redis(config.redis);
  await flushAllRedisData(redisClient);

  const request = supertest(app);
  return {
    request,
    config
  };
};