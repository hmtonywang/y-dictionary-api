'use strict';

const express = require('express');
const supertest = require('supertest');
const sinon = require('sinon');
const { Redis } = require('ioredis');
const { flushAllRedisData } = require('../../../../utils');
const routes = require('../../../../../frameworks/webserver/routes');
const config = require('../../../../../config');
const redisConnection = require('../../../../../frameworks/database/redis/connection');

module.exports = async function setup (conf = {}) {
  const app = express();
  const mockLogger = {
    info: sinon.fake(),
    error: sinon.fake(),
    child: sinon.stub().returnsThis()
  };
  const mockConfig = {
    ...config,
    ...conf
  };
  const redisClient = await redisConnection({
    Redis,
    url: mockConfig.redis,
    logger: mockLogger
  }).createRedisClient();

  await flushAllRedisData(redisClient);
  // Set routes
  routes({
    app,
    express,
    redisClient,
    config: mockConfig,
    logger: mockLogger
  });
  const request = supertest(app);
  return {
    request,
    config
  };
};