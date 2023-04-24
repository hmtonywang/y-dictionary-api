/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const moment = require('moment');
const authMiddleware = require('../../../../frameworks/middlewares/auth');
const hmac = require('../../../../libs/hmac');

const API_KEY = 'api-key';
const EXPIRY = 5;
const ALGORITHM = 'sha512';
const METHOD = 'GET';
const ORIGINAL_URL = '/v1/words/test';

const config = {
  auth: {
    apiKey: API_KEY,
    expiry: EXPIRY
  }
};

const createReq = (headers = {}) => {
  return {
    method: METHOD,
    originalUrl: ORIGINAL_URL,
    setHeaders: (obj) => {
      headers = { ...headers, ...obj };
    },
    header: (key) => headers[key]
  };
};

describe('frameworks/middlewares/auth', () => {
  it('should throw an error if no config', () => {
    expect(authMiddleware).to.throw();
  });

  it('should skip auth if req.method is OPTIONS', () => {
    const middleware = authMiddleware({ config });
    const req = createReq();
    req.method = 'OPTIONS';
    const res = {};
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(next.calledOnce);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-API-KEY header is unset', () => {
    const middleware = authMiddleware({ config });
    const req = createReq();
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-API-KEY header is invalid', () => {
    const middleware = authMiddleware({ config });
    const req = createReq({ 'X-API-KEY': 'XXXX' });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-TIMESTAMP header is unset', () => {
    const middleware = authMiddleware({ config });
    const req = createReq({ 'X-API-KEY': API_KEY });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-TIMESTAMP header is future', () => {
    const middleware = authMiddleware({ config });
    const req = createReq({
      'X-API-KEY': API_KEY,
      'X-TIMESTAMP': moment().add(1, 'minutes').valueOf()
    });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-TIMESTAMP header is expired', () => {
    const middleware = authMiddleware({ config });
    const req = createReq({
      'X-API-KEY': API_KEY,
      'X-TIMESTAMP': moment().subtract(EXPIRY + 1, 'milliseconds').valueOf()
    });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-TIMESTAMP header is invalid', () => {
    const middleware = authMiddleware({ config });
    const req = createReq({
      'X-API-KEY': API_KEY,
      'X-TIMESTAMP': 'timestamp'
    });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-SIGNATURE header is unset', () => {
    const middleware = authMiddleware({ config });
    const timestamp = moment().valueOf();
    const req = createReq({
      'X-API-KEY': API_KEY,
      'X-TIMESTAMP': timestamp
    });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call res.unauthorized function once if X-SIGNATURE header is invalid', () => {
    const middleware = authMiddleware({ config });
    const timestamp = moment().valueOf();
    const req = createReq({
      'X-API-KEY': API_KEY,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': 'XXXXX'
    });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });

  it('should call next function once if authorization succeed', () => {
    const middleware = authMiddleware({ config });
    const req = createReq();
    const timestamp = moment().valueOf();
    const signature = hmac.sign(`${req.method}&${req.originalUrl}&${timestamp}`, API_KEY, ALGORITHM);
    req.setHeaders({
      'X-API-KEY': API_KEY,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    });
    const res = { unauthorized: sandbox.spy() };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(res.unauthorized.calledOnce);
    expect(next.notCalled);
    sandbox.restore();
  });
});
