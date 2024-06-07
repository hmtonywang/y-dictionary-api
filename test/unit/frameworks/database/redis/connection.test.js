/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const Redis = require('ioredis');
const connection = require('../../../../../frameworks/database/redis/connection');

describe('connection', () => {
  const FakeRedis = sinon.fake();
  FakeRedis.prototype.on = sinon.fake();
  const logger = { info: sinon.fake(), error: sinon.fake() };

  afterEach(() => {
    sinon.restore();
  });

  it('should return an object with a createRedisClient function', () => {
    const config = {};

    const redisConnection = connection({ Redis: FakeRedis, config, logger });

    expect(redisConnection).has.property('createRedisClient');
    expect(redisConnection.createRedisClient).to.be.a('function');
  });

  it('should create a redis client with the correct URL', () => {
    const config = { url: 'redis://localhost:6379' };

    const redisConnection = connection({ Redis: FakeRedis, config, logger });
    const redisClient = redisConnection.createRedisClient();

    expect(FakeRedis.calledOnceWithExactly(config.url)).to.be.true;
    expect(redisClient instanceof FakeRedis).to.be.true;
  });

  it('should create a ioredis client', () => {
    const config = { url: 'redis://localhost:6379' };

    const redisConnection = connection({ Redis, config, logger });
    const redisClient = redisConnection.createRedisClient();

    expect(redisClient instanceof Redis).to.be.true;
  });
});
