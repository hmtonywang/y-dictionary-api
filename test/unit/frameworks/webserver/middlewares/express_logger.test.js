/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const { EventEmitter } = require('events');
const expressLoggerMiddleware = require('../../../../../frameworks/webserver/middlewares/express_logger');

describe('express logger middleware', () => {
  const fakeMethod = 'GET';
  const fakeUrl = '/';

  afterEach(() => {
    sinon.restore();
  });

  it('should log request including id, ip, method and url', () => {
    const logger = { info: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = expressLoggerMiddleware({ logger });

    const req = httpMocks.createRequest({
      method: fakeMethod,
      url: fakeUrl
    });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(logger.child.calledOnce).to.be.true;
    const arg = logger.child.firstCall.firstArg;
    expect(Object.keys(arg).length).to.be.equal(4);
    expect(arg).has.property('id');
    expect(arg.id).to.be.a('string');
    expect(arg).has.property('ip');
    expect(arg).has.property('method');
    expect(arg.method).to.be.equal(fakeMethod);
    expect(arg).has.property('url');
    expect(arg.url).to.be.equal(fakeUrl);
    expect(logger.info.calledOnceWithExactly('req')).to.be.true;
  });

  it('should log response including id, statusCode, contentLength and duration', (done) => {
    const logger = { info: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = expressLoggerMiddleware({ logger });

    const data = 'Hi!';
    const contentLength = data.length;
    const statusCode = 400;

    const req = httpMocks.createRequest({
      method: fakeMethod,
      url: fakeUrl
    });
    const res = httpMocks.createResponse({
      req,
      eventEmitter: EventEmitter
    });
    const next = () => {
      res.on('finish', () => {
        expect(res._isEndCalled()).to.be.true;
        expect(logger.child.calledTwice).to.be.true;
        const firstCallArg = logger.child.firstCall.firstArg;
        const secondCallArg = logger.child.secondCall.firstArg;
        expect(Object.keys(secondCallArg).length).to.be.equal(4);
        expect(secondCallArg).has.property('id');
        expect(secondCallArg.id).to.be.a('string');
        expect(secondCallArg.id).to.be.equal(firstCallArg.id);
        expect(secondCallArg).has.property('statusCode');
        expect(secondCallArg.statusCode).to.be.equal(statusCode);
        expect(secondCallArg).has.property('contentLength');
        expect(secondCallArg.contentLength).to.be.equal(contentLength);
        expect(secondCallArg).has.property('duration');
        expect(secondCallArg.duration).to.be.a('number');
        expect(logger.info.calledTwice).to.be.true;
        expect(logger.info.secondCall.firstArg).to.be.equal('res');
        done();
      });
      res.setHeader('content-length', contentLength);
      res.status(statusCode).send(data);
    };

    middleware(req, res, next);
  });
});
