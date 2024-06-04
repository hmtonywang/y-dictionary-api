/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const rateLimitService = require('../../../../application/services/rate_limit');

describe('rate limit service', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if service is not provided', () => {
    expect(() => rateLimitService()).to.throw();
  });

  it('should throw an error if service.createRateLimiter is not provided', () => {
    const service = {};
    expect(() => rateLimitService(service)).to.throw();
  });

  it('should return an object with a createRateLimiter function', () => {
    const service = { createRateLimiter: sinon.fake() };

    const result = rateLimitService(service);

    expect(result).has.property('createRateLimiter');
    expect(result.createRateLimiter).to.be.a('function');
  });

  it('should call service.createRateLimiter', async () => {
    const service = { createRateLimiter: sinon.fake() };

    const rateLimit = rateLimitService(service);
    const options = { a: 1, b: '2' };
    rateLimit.createRateLimiter(options);

    expect(service.createRateLimiter.calledOnceWithExactly(options)).to.be.true;
  });
});
