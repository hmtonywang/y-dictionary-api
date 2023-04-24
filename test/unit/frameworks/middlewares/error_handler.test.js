/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const errorHandlerMiddleware = require('../../../../frameworks/middlewares/error_handler');

describe('frameworks/middlewares/error_handler', () => {
  let loggerError;
  let middleware;

  before(() => {
    loggerError = sandbox.spy();
    const logger = () => {
      return {
        error: loggerError
      };
    };
    middleware = errorHandlerMiddleware({ logger });
  });

  it('should log error', () => {
    const req = {};
    const res = {
      fail: sandbox.spy()
    };
    const next = sandbox.spy();
    const error = new Error('something wrong');
    error.statusCode = '400';
    middleware(error, req, res, next);
    expect(loggerError.calledOnce);
    expect(res.fail.calledOnceWith(error.message, error.statusCode));
    expect(next.notCalled);
  });

  after(() => {
    sandbox.restore();
  });
});
