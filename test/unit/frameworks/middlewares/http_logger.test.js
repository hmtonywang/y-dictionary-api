/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const loggerMiddleware = require('../../../../frameworks/middlewares/http_logger');

describe('frameworks/middlewares/http_logger', () => {
  let loggerInfo;
  let middleware;

  before(() => {
    loggerInfo = sandbox.spy();
    const logger = () => {
      const obj = {
        info: loggerInfo
      };
      obj.child = () => obj;
      return obj;
    };
    middleware = loggerMiddleware(logger);
  });

  it('should log twice', () => {
    const req = {};
    const res = {
      send: sandbox.spy(),
      on: (event, callback) => callback()
    };
    const next = sandbox.spy();
    middleware(req, res, next);
    expect(loggerInfo.calledOnce);
    res.send();
    expect(loggerInfo.calledTwice);
    expect(next.calledOnce);
  });

  after(() => {
    sandbox.restore();
  });
});
