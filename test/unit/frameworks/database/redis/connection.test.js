/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const connection = require('../../../../../frameworks/database/redis/connection');

describe('connection', () => {
  const Redis = sinon.fake();
  Redis.prototype.on = sinon.fake();
  const logger = { info: sinon.fake(), error: sinon.fake() };
  afterEach(() => {
    sinon.restore();
  });

  it('should return an object with a createRedisClient function', () => {
    const config = {};

    const result = connection({ Redis, config, logger });

    expect(result).has.property('createRedisClient');
    expect(result.createRedisClient).to.be.a('function');
  });

  it('should create a Redis client with the correct URL', () => {
    const config = { url: 'redis://localhost:6379' };

    const redisClient = connection({ Redis, config, logger }).createRedisClient();

    expect(Redis.calledOnceWithExactly(config.url)).to.be.true;
    expect(redisClient instanceof Redis).to.be.true;
  });
});
