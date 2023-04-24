/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const cacheMiddleware = require('../../../../frameworks/middlewares/cache');

describe('frameworks/middlewares/cache', () => {
  let loggerError;
  let logger;
  let req;
  let res;
  let next;
  let cacheKey;

  before(() => {
    loggerError = sandbox.spy();
    logger = () => {
      return { error: loggerError };
    };
    req = {
      method: 'method',
      originalUrl: 'originalUrl'
    };
    res = {
      send: sandbox.spy(),
      json: sandbox.spy()
    };
    res.status = () => res;
    next = sandbox.spy();
    cacheKey = `${req.method}_${req.originalUrl}`;
  });

  it('should miss cache then write data to cache', () => {
    const cacheImpl = {
      get: sandbox.spy(),
      set: sandbox.spy()
    };
    const middleware = cacheMiddleware({ cacheImpl, logger });
    middleware(req, res, next);
    expect(cacheImpl.get.calledOnceWith(cacheKey));
    expect(res.send.notCalled);
    expect(res.json.notCalled);
    expect(loggerError.notCalled);
    expect(next.calledOnce);

    res.statusCode = 200;
    const data = 'data';
    res.send(data);
    expect(cacheImpl.set.calledOnceWith(cacheKey, data));
    expect(loggerError.notCalled);
    sandbox.restore();
  });

  it('should miss cache then skip writing data to cache', () => {
    const cacheImpl = {
      get: sandbox.spy(),
      set: sandbox.spy()
    };
    const middleware = cacheMiddleware({ cacheImpl, logger });
    middleware(req, res, next);
    expect(cacheImpl.get.calledOnceWith(cacheKey));
    expect(res.send.notCalled);
    expect(res.json.notCalled);
    expect(loggerError.notCalled);
    expect(next.calledOnce);

    res.statusCode = 400;
    const data = 'data';
    res.send(data);
    expect(cacheImpl.set.notCalled);
    expect(loggerError.notCalled);
    sandbox.restore();
  });

  it('should hit cache', () => {
    const cacheImpl = {
      get: () => {},
      set: sandbox.spy()
    };
    const data = 'data';
    const getStub = sandbox.stub(cacheImpl, 'get').returns(data);
    const middleware = cacheMiddleware({ cacheImpl, logger });
    middleware(req, res, next);
    expect(cacheImpl.get.calledOnceWith(cacheKey));
    expect(res.send.calledOnce);
    expect(cacheImpl.set.notCalled);
    expect(loggerError.notCalled);
    expect(next.notCalled);
    getStub.restore();
    sandbox.restore();
  });

  it('should hit cache', () => {
    const cacheImpl = {
      get: () => {},
      set: sandbox.spy()
    };
    const data = { key: 'value' };
    const getStub = sandbox.stub(cacheImpl, 'get').returns(data);
    const middleware = cacheMiddleware({ cacheImpl, logger });
    middleware(req, res, next);
    expect(cacheImpl.get.calledOnceWith(cacheKey));
    expect(res.json.calledOnce);
    expect(cacheImpl.set.notCalled);
    expect(loggerError.notCalled);
    expect(next.notCalled);
    getStub.restore();
    sandbox.restore();
  });

  it('should log error if something get wrong', () => {
    const cacheImpl = {
      get: () => {},
      set: () => {}
    };
    const getStub = sandbox.stub(cacheImpl, 'get').throws();
    const setStub = sandbox.stub(cacheImpl, 'set').throws();
    const middleware = cacheMiddleware({ cacheImpl, logger });
    middleware(req, res, next);
    expect(cacheImpl.get.calledOnceWith(cacheKey));
    expect(res.send.notCalled);
    expect(res.json.notCalled);
    expect(loggerError.calledOnce);
    expect(next.calledOnce);

    res.statusCode = 200;
    const data = 'data';
    res.send(data);
    expect(cacheImpl.set.calledOnceWith(cacheKey, data));
    expect(loggerError.calledTwice);
    getStub.restore();
    setStub.restore();
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });
});
