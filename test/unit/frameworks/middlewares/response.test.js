/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const responseMiddleware = require('../../../../frameworks/middlewares/response');
const { RESPONSE } = responseMiddleware;

describe('frameworks/middlewares/response', () => {
  const res = {};
  let next;

  before(() => {
    res.status = () => res;
    res.json = sandbox.spy();
    const req = {};
    next = sandbox.spy();
    responseMiddleware(req, res, next);
  });

  it('should set functions to res', () => {
    expect(next.calledOnce);
    expect(res).to.have.own.property('respond');
    expect(res.respond).to.be.a('function');
    expect(res).to.have.own.property('fail');
    expect(res.fail).to.be.a('function');
    expect(res).to.have.own.property('unauthorized');
    expect(res.unauthorized).to.be.a('function');
    expect(res).to.have.own.property('notFound');
    expect(res.notFound).to.be.a('function');
    expect(res).to.have.own.property('validationError');
    expect(res.validationError).to.be.a('function');
    expect(res).to.have.own.property('tooManyRequests');
    expect(res.tooManyRequests).to.be.a('function');
    expect(res).to.have.own.property('internalServerError');
    expect(res.internalServerError).to.be.a('function');
  });

  it('should respond ok', () => {
    const data = 'data';
    res.respond(data);
    expect(res.json.calledOnceWith({
      status: RESPONSE.OK.status,
      message: RESPONSE.OK.message,
      data
    }));
  });

  it('should respond unauthorized', () => {
    res.unauthorized();
    expect(res.json.calledOnceWith({
      status: RESPONSE.UNAUTHORIZED.status,
      message: RESPONSE.UNAUTHORIZED.message,
      error: RESPONSE.UNAUTHORIZED.status.toString()
    }));
  });

  it('should respond bad request', () => {
    res.validationError();
    expect(res.json.calledOnceWith({
      status: RESPONSE.BAD_REQUEST.status,
      message: RESPONSE.BAD_REQUEST.message,
      error: RESPONSE.BAD_REQUEST.status.toString()
    }));
  });

  it('should respond too many requests', () => {
    res.tooManyRequests();
    expect(res.json.calledOnceWith({
      status: RESPONSE.TOO_MANY_REQUESTS.status,
      message: RESPONSE.TOO_MANY_REQUESTS.message,
      error: RESPONSE.TOO_MANY_REQUESTS.status.toString()
    }));
  });

  it('should respond internal server error', () => {
    res.internalServerError();
    expect(res.json.calledOnceWith({
      status: RESPONSE.INTERNAL_SERVER_ERROR.status,
      message: RESPONSE.INTERNAL_SERVER_ERROR.message,
      error: RESPONSE.INTERNAL_SERVER_ERROR.status.toString()
    }));
  });

  it('should respond internal server error', () => {
    res.fail();
    expect(res.json.calledOnceWith({
      status: RESPONSE.INTERNAL_SERVER_ERROR.status,
      message: RESPONSE.INTERNAL_SERVER_ERROR.message,
      error: RESPONSE.INTERNAL_SERVER_ERROR.status.toString()
    }));
  });

  it('should respond created with correct data format', () => {
    const data = {
      a: 1,
      b: '2',
      c: ['c']
    };
    const status = 201;
    const message = 'CREATED';
    const moreInfo = { more: { name: 'test' } };
    res.respond(data, status, message, moreInfo);
    expect(res.json.calledOnceWith({
      status,
      message,
      data,
      ...moreInfo
    }));
  });

  it('should respond forbidden with correct data format', () => {
    const status = 403;
    const message = 'FORBIDDEN';
    const code = 'E403';
    res.fail(message, status, code);
    expect(res.json.calledOnceWith({
      status,
      message,
      error: code
    }));
  });

  after(() => {
    sandbox.restore();
  });
});
