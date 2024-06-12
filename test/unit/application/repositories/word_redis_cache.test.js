/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const wordRedisCacheRepository = require('../../../../application/repositories/word_redis_cache');

describe('word redis cache repository', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if repository is not provided', () => {
    expect(() => wordRedisCacheRepository()).to.throw();
  });

  it('should throw an error if repository.set is not provided', () => {
    const repository = { get: sinon.fake() };
    expect(() => wordRedisCacheRepository(repository)).to.throw();
  });

  it('should throw an error if repository.get is not provided', () => {
    const repository = { set: sinon.fake() };
    expect(() => wordRedisCacheRepository(repository)).to.throw();
  });

  it('should return an object with set and get functions', () => {
    const repository = { set: sinon.fake(), get: sinon.fake() };

    const result = wordRedisCacheRepository(repository);

    expect(result).has.property('set');
    expect(result.set).to.be.a('function');
    expect(result).has.property('get');
    expect(result.get).to.be.a('function');
  });

  it('should set and get values from repository', async () => {
    const key = 'key';
    const value = 'value';
    const repository = {
      set: sinon.fake.resolves(true),
      get: sinon.fake.resolves(value)
    };

    const repo = wordRedisCacheRepository(repository);
    await repo.set(key, value);
    const actualValue = await repo.get(key);

    expect(repository.set.calledOnce).to.be.true;
    expect(repository.get.calledOnce).to.be.true;
    expect(actualValue).to.be.equal(value);
  });
});
