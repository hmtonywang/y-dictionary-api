/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const redisCacheRepository = require('../../../../../../frameworks/database/redis/repositories/redis_cache');

describe('redis cache repository', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if Redis client is not provided', async () => {
    expect(() => redisCacheRepository()).to.throw();
  });

  it('should throw an error if Redis client.set is not provided', async () => {
    const redisClient = { get: sinon.fake() };

    expect(() => redisCacheRepository(redisClient)).to.throw();
  });

  it('should throw an error if Redis client.get is not provided', async () => {
    const redisClient = { set: sinon.fake() };

    expect(() => redisCacheRepository(redisClient)).to.throw();
  });

  it('should return an object with a set and get function', async () => {
    const redisClient = { get: sinon.fake(), set: sinon.fake() };
    const repo = redisCacheRepository(redisClient);

    expect(repo).has.property('set');
    expect(repo.set).to.be.a('function');
    expect(repo).has.property('get');
    expect(repo.get).to.be.a('function');
  });

  it('should set and get values from Redis client', async () => {
    const key = 'redis-key';
    const value = 'redis-value';
    const redisClient = {
      get: sinon.fake.resolves(value),
      set: sinon.fake.resolves(true)
    };

    const repo = redisCacheRepository(redisClient);
    await repo.set(key, value);
    const actualValue = await repo.get(key);

    expect(redisClient.set.calledOnce).to.be.true;
    expect(redisClient.get.calledOnce).to.be.true;
    expect(actualValue).to.be.equal(value);
  });
});
