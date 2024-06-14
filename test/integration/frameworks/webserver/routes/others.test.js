/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const setup = require('./setup');
const { hmacSign } = require('../../../../utils');

describe('Route others', () => {
  let mockServer;

  before(async () => {
    mockServer = await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should respond 200 if send OPTIONS to available path', async () => {
    const apiPath = '/v1/words/test';
    const res = await mockServer.request.options(apiPath);
    expect(res.status).to.be.equal(200);
  });

  it('should respond 404 if send OPTIONS to undefined path', async () => {
    const apiPath = '/v9/words/test';
    const res = await mockServer.request.options(apiPath);
    expect(res.status).to.be.equal(404);
  });

  it('should respond 404 if send GET to undefined path', async () => {
    const apiPath = '/undefined/path';
    const { hmacSignature: hmacSignatureConfig } = mockServer.config;
    const hmacSignature = hmacSign({
      method: 'GET',
      path: apiPath,
      key: hmacSignatureConfig.apiKey,
      algorithm: hmacSignatureConfig.algorithm
    });
    const res = await mockServer.request
      .get(apiPath)
      .set('X-API-KEY', hmacSignatureConfig.apiKey)
      .set('X-TIMESTAMP', hmacSignature.timestamp)
      .set('X-SIGNATURE', hmacSignature.signature);
    expect(res.status).to.be.equal(404);
  });
});
