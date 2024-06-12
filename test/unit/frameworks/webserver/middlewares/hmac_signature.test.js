/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const { BadRequest } = require('http-errors');
const httpMocks = require('node-mocks-http');
const moment = require('moment');
const hmacSignatureMiddleware = require('../../../../../frameworks/webserver/middlewares/hmac_signature');
const hmacSignatureInterface = require('../../../../../application/services/hmac_signature');
const hmacSignatureImpl = require('../../../../../frameworks/services/hmac_signature');

describe('hmac signature middleware', () => {
  const config = {
    apiKey: 'api key',
    expireTimeSec: 10,
    algorithm: 'sha512'
  };
  const method = 'GET';
  const originalUrl = '/url';

  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if options is not provided', () => {
    expect(() => hmacSignatureMiddleware()).to.throw();
  });

  it('should throw an error if options.hmacSignatureInterface is not provided', () => {
    const options = {
      hmacSignatureImpl: sinon.fake(),
      config
    };
    expect(() => hmacSignatureMiddleware(options)).to.throw();
  });

  it('should throw an error if options.hmacSignatureInterface is not a function', () => {
    const options = {
      hmacSignatureInterface: {},
      hmacSignatureImpl: sinon.fake(),
      config
    };
    expect(() => hmacSignatureMiddleware(options)).to.throw();
  });

  it('should throw an error if options.hmacSignatureImpl is not provided', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      config
    };
    expect(() => hmacSignatureMiddleware(options)).to.throw();
  });

  it('should throw an error if options.hmacSignatureImpl is not a function', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: {},
      config
    };
    expect(() => hmacSignatureMiddleware(options)).to.throw();
  });

  it('should throw an error if options.config is not provided', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake()
    };
    expect(() => hmacSignatureMiddleware(options)).to.throw();
  });

  it('should return a express middleware function', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);

    expect(middleware).to.be.a('function');
  });

  it('should skip middleware if method is OPTIONS', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);

    const req = httpMocks.createRequest({ method: 'OPTIONS' });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.undefined;
  });

  it('should call next() with 400 error if req.header(X-API-KEY) is not provided', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() with 400 error if req.header(X-API-KEY) is invalid', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = { 'X-API-KEY': 'invalid api key' };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() with 400 error if req.header(X-TIMESTAMP) is not provided', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = { 'X-API-KEY': config.apiKey };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() with 400 error if req.header(X-TIMESTAMP) is invalid', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': 'invalid timestamp'
    };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() with 400 error if req.header(X-TIMESTAMP) is expired', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': moment().subtract(config.expireTimeSec + 1, 'seconds').valueOf()
    };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() with 400 error if req.header(X-TIMESTAMP) is a future timestamp', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': moment().add(1, 'hours').valueOf()
    };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() with 400 error if req.header(X-SIGNATURE) is not provided', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': moment().valueOf()
    };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should throw a TypeError if the hmac signature sign function is not implemented', () => {
    const options = {
      hmacSignatureInterface: sinon.fake(),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': moment().valueOf(),
      'X-SIGNATURE': 'fake signature'
    };
    const req = httpMocks.createRequest({
      headers,
      method,
      originalUrl
    });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    expect(() => middleware(req, res, next)).to.throw();
  });

  it('should call next() with 400 error if req.header(X-SIGNATURE) is invalid', () => {
    const fakeHmacSignature = { sign: sinon.fake() };
    const options = {
      hmacSignatureInterface: sinon.fake.returns(fakeHmacSignature),
      hmacSignatureImpl: sinon.fake(),
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': moment().valueOf(),
      'X-SIGNATURE': 'invalid signature'
    };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });

  it('should call next() without error if req.header(X-SIGNATURE) is valid', () => {
    const options = {
      hmacSignatureInterface,
      hmacSignatureImpl,
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const timestamp = moment().valueOf();
    const str = `${method}&${originalUrl}&${timestamp}`;
    const signature = hmacSignatureImpl().sign(str, config.apiKey, config.algorithm);
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    };
    const req = httpMocks.createRequest({
      headers,
      method,
      originalUrl
    });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.undefined;
  });

  it('should call next() with a 400 error if algorithm is different', () => {
    const options = {
      hmacSignatureInterface,
      hmacSignatureImpl,
      config
    };
    const middleware = hmacSignatureMiddleware(options);
    const timestamp = moment().valueOf();
    const str = `${method}&${originalUrl}&${timestamp}`;
    const signature = hmacSignatureImpl().sign(str, config.apiKey, 'sha256');
    const headers = {
      'X-API-KEY': config.apiKey,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    };
    const req = httpMocks.createRequest({
      headers,
      method,
      originalUrl
    });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('Error');
    expect(next.firstCall.firstArg.status).to.be.equal(BadRequest().status);
  });
});
