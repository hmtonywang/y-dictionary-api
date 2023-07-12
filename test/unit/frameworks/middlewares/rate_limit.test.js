/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const rateLimitMiddleware = require('../../../../frameworks/middlewares/rate_limit');

const req = {
  ip: '1'
};
const res = {};

describe('frameworks/middlewares/rate_limit', () => {
  it('should return a createRateLimit function and a requestsInSeconds function', () => {
    const middleware = rateLimitMiddleware({ config: { rateLimit: false } });
    expect(middleware).to.have.own.property('createRateLimit');
    expect(middleware.createRateLimit).to.be.a('function');
    expect(middleware).to.have.own.property('requestsInSeconds');
    expect(middleware.requestsInSeconds).to.be.a('function');
  });

  it('should return a function', () => {
    const middleware = rateLimitMiddleware({
      config: { rateLimit: true }
    });
    expect(middleware.createRateLimit({
      windowMs: 10 * 1000,
      max: 1
    })).to.be.a('function');
    expect(middleware.requestsInSeconds(1, 1)).to.be.a('function');
  });

  it('should disable rate limit', () => {
    const middleware = rateLimitMiddleware({
      config: { rateLimit: false }
    });
    const rateLimit = middleware.createRateLimit({
      windowMs: 10 * 1000,
      max: 1
    });
    const next = sandbox.spy();
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    expect(next.calledThrice);
    sandbox.restore();
  });

  it('should disable rate limit', () => {
    const middleware = rateLimitMiddleware({
      config: { rateLimit: false }
    });
    const rateLimit = middleware.requestsInSeconds(10, 1);
    const next = sandbox.spy();
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    expect(next.calledThrice);
    sandbox.restore();
  });

  it('should call next once and res.tooManyRequests twice', () => {
    const middleware = rateLimitMiddleware({
      config: { rateLimit: true }
    });
    const rateLimit = middleware.createRateLimit({
      windowMs: 10 * 1000,
      max: 1
    });
    const res = {
      tooManyRequests: sandbox.spy()
    };
    const next = sandbox.spy();
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    expect(next.calledOnce);
    expect(res.tooManyRequests.calledTwice);
    sandbox.restore();
  });

  it('should call next twice and res.tooManyRequests once', () => {
    const middleware = rateLimitMiddleware({
      config: { rateLimit: true }
    });
    const rateLimit = middleware.requestsInSeconds(10, 2);
    const res = {
      tooManyRequests: sandbox.spy()
    };
    const next = sandbox.spy();
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    expect(next.calledTwice);
    expect(res.tooManyRequests.calledOnce);
    sandbox.restore();
  });

  it('should call next thrice', () => {
    const middleware = rateLimitMiddleware({
      config: { rateLimit: true }
    });
    const rateLimit = middleware.requestsInSeconds(10, 3);
    const res = {
      tooManyRequests: sandbox.spy()
    };
    const next = sandbox.spy();
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    rateLimit(req, res, next);
    expect(next.calledThrice);
    sandbox.restore();
  });
});
