/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const localRateLimitService = require('../../../../frameworks/services/local_rate_limit');

describe('local rate limit service', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return an object with a createRateLimiter function', () => {
    const result = localRateLimitService();

    expect(result).has.property('createRateLimiter');
    expect(result.createRateLimiter).to.be.a('function');
  });

  it('should return a express middleware function from createRateLimiter', async () => {
    const service = localRateLimitService();
    const ops = {};
    const result = service.createRateLimiter(ops);

    expect(result).to.be.a('function');
  });
});
