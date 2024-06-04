/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const redisRateLimitService = require('../../../../frameworks/services/redis_rate_limit');

describe('redis rate limit service', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if options is not provided', () => {
    expect(() => redisRateLimitService()).to.throw();
  });

  it('should throw an error if options.redisRepositoryInterface is not provided', () => {
    const options = {
      redisRepositoryImpl: sinon.fake(),
      redisClient: sinon.fake()
    };
    expect(() => redisRateLimitService(options)).to.throw();
  });

  it('should throw an error if options.redisRepositoryInterface is not a function', () => {
    const options = {
      redisRepositoryInterface: {},
      redisRepositoryImpl: sinon.fake(),
      redisClient: sinon.fake()
    };
    expect(() => redisRateLimitService(options)).to.throw();
  });

  it('should throw an error if options.redisRepositoryImpl is not provided', () => {
    const options = {
      redisRepositoryInterface: sinon.fake(),
      redisClient: sinon.fake()
    };
    expect(() => redisRateLimitService(options)).to.throw();
  });

  it('should throw an error if options.redisRepositoryImpl is not a function', () => {
    const options = {
      redisRepositoryInterface: sinon.fake(),
      redisRepositoryImpl: {},
      redisClient: sinon.fake()
    };
    expect(() => redisRateLimitService(options)).to.throw();
  });

  it('should return an object with a createRateLimiter function', () => {
    const options = {
      redisRepositoryInterface: sinon.fake(),
      redisRepositoryImpl: sinon.fake(),
      redisClient: sinon.fake()
    };

    const result = redisRateLimitService(options);

    expect(result).has.property('createRateLimiter');
    expect(result.createRateLimiter).to.be.a('function');
  });

  it('should return a express middleware function from createRateLimiter', async () => {
    const options = {
      redisRepositoryInterface: sinon.fake(),
      redisRepositoryImpl: sinon.fake(),
      redisClient: sinon.fake()
    };

    const service = redisRateLimitService(options);
    const ops = {};
    const result = service.createRateLimiter(ops);

    expect(result).to.be.a('function');
  });
});
