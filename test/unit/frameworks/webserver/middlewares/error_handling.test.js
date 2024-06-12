/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const createHttpError = require('http-errors');
const { BadRequest, InternalServerError } = createHttpError;
const httpMocks = require('node-mocks-http');
const errorHandlingMiddleware = require('../../../../../frameworks/webserver/middlewares/error_handling');

describe('error handling middleware', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should send 400 error response without logging', () => {
    const config = { env: 'development' };
    const logger = { error: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = errorHandlingMiddleware({ logger, config });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    const err = createHttpError(400);

    middleware(err, req, res, next);

    const resData = res._getJSONData();
    expect(logger.child.notCalled);
    expect(logger.error.notCalled);
    expect(res._isEndCalled()).to.be.true;
    expect(res._isJSON()).to.be.true;
    expect(res.statusCode).to.be.equal(err.status);
    expect(Object.keys(resData).length).to.be.equal(2);
    expect(resData).has.property('status');
    expect(resData.status).to.be.equal(err.status);
    expect(resData).has.property('message');
    expect(resData.message).to.be.equal(BadRequest().message);
  });

  it('should send 400 error response with customized message without logging', () => {
    const config = { env: 'development' };
    const logger = { error: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = errorHandlingMiddleware({ logger, config });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    const customErrorMessage = 'Custom Error Message';
    const err = createHttpError(400, customErrorMessage);

    middleware(err, req, res, next);

    const resData = res._getJSONData();
    expect(logger.child.notCalled);
    expect(logger.error.notCalled);
    expect(res._isEndCalled()).to.be.true;
    expect(res._isJSON()).to.be.true;
    expect(res.statusCode).to.be.equal(err.status);
    expect(Object.keys(resData).length).to.be.equal(2);
    expect(resData).has.property('status');
    expect(resData.status).to.be.equal(err.status);
    expect(resData).has.property('message');
    expect(resData.message).to.be.equal(customErrorMessage);
    expect(next.notCalled).to.be.true;
  });

  it('should log error which status >= 500', () => {
    const config = { env: 'development' };
    const logger = { error: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = errorHandlingMiddleware({ logger, config });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    const err = createHttpError(504);

    middleware(err, req, res, next);

    const resData = res._getJSONData();
    expect(logger.child.calledOnce);
    expect(logger.error.calledOnceWithExactly(err));
    expect(res._isEndCalled()).to.be.true;
    expect(res._isJSON()).to.be.true;
    expect(res.statusCode).to.be.equal(err.status);
    expect(Object.keys(resData).length).to.be.equal(2);
    expect(resData).has.property('status');
    expect(resData.status).to.be.equal(err.status);
    expect(resData).has.property('message');
    expect(resData.message).to.be.equal(err.message);
    expect(next.notCalled).to.be.true;
  });

  it('should log and send 500 error response by default with default message', () => {
    const config = { env: 'development' };
    const logger = { error: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = errorHandlingMiddleware({ logger, config });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    const err = new Error();

    middleware(err, req, res, next);

    const resData = res._getJSONData();
    expect(logger.child.calledOnce);
    expect(logger.error.calledOnceWithExactly(err));
    expect(res._isEndCalled()).to.be.true;
    expect(res._isJSON()).to.be.true;
    expect(res.statusCode).to.be.equal(InternalServerError().status);
    expect(Object.keys(resData).length).to.be.equal(2);
    expect(resData).has.property('status');
    expect(resData.status).to.be.equal(InternalServerError().status);
    expect(resData).has.property('message');
    expect(resData.message).to.be.equal(InternalServerError().message);
    expect(next.notCalled).to.be.true;
  });

  it('should log customized error message and send default error message in production environment', () => {
    const config = { env: 'production' };
    const logger = { error: sinon.fake(), child: sinon.stub().returnsThis() };
    const middleware = errorHandlingMiddleware({ logger, config });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    const customErrorMessage = 'Custom Error Message';
    const err = createHttpError(500, customErrorMessage);

    middleware(err, req, res, next);

    const resData = res._getJSONData();
    expect(logger.child.calledOnce);
    expect(logger.error.calledOnceWithExactly(err));
    expect(res._isEndCalled()).to.be.true;
    expect(res._isJSON()).to.be.true;
    expect(res.statusCode).to.be.equal(err.status);
    expect(Object.keys(resData).length).to.be.equal(2);
    expect(resData).has.property('status');
    expect(resData.status).to.be.equal(err.status);
    expect(resData).has.property('message');
    expect(resData.message).to.be.equal(InternalServerError().message);
    expect(next.notCalled).to.be.true;
  });
});
