/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const wordController = require('../../../../frameworks/controllers/word');
const ydHTML = fs.readFileSync(
  path.resolve(__dirname, '../../../test_data/yahoo_dictionary.html')
);

describe('frameworks/controllers/word', () => {
  it('should throw an error if no logger', () => {
    expect(wordController).to.throw();
  });

  it('should have a getMeaning function', () => {
    const logger = () => {};
    const controller = wordController({ logger });
    expect(controller).to.have.own.property('getMeaning');
    expect(controller.getMeaning).to.be.a('function');
  });

  it('should call logger.error and res.internalServerError once if req.params.word is invalid', async () => {
    const error = sandbox.spy();
    const logger = () => ({ error });
    const controller = wordController({ logger });
    const req = { params: {} };
    const res = { internalServerError: sandbox.spy() };
    await controller.getMeaning(req, res);
    expect(error.calledOnce);
    expect(res.internalServerError.calledOnce);
    sandbox.restore();
  });

  it('should call logger.error and res.internalServerError once if something get wrong with crawler', async () => {
    const stub = sandbox.stub(axios, 'get').throws();
    const error = sandbox.spy();
    const logger = () => ({ error });
    const controller = wordController({ logger });
    const req = { params: {} };
    const res = { internalServerError: sandbox.spy() };
    await controller.getMeaning(req, res);
    expect(error.calledOnce);
    expect(res.internalServerError.calledOnce);
    stub.restore();
    sandbox.restore();
  });

  it('should call res.respond once if req.params.word is valid', async () => {
    const stub = sandbox.stub(axios, 'get').returns({ data: ydHTML });
    const logger = () => {};
    const controller = wordController({ logger });
    const req = { params: { word: 'test' } };
    const res = { respond: sandbox.spy() };
    await controller.getMeaning(req, res);
    expect(res.respond.calledOnce);
    stub.restore();
    sandbox.restore();
  });
});
