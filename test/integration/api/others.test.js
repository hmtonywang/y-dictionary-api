/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const setup = require('./setup');
const { hmacSign } = require('../../utils');

describe('Api others', () => {
  let mockServer;

  before(async () => {
    mockServer = await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should respond 400 if there is no hmac signature headers in request', async () => {
    const apiPath = '/undefined';
    const res = await mockServer.request.get(apiPath);
    expect(res.headers['content-type']).to.match(/json/);
    expect(res.status).to.be.equal(400);
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
    expect(res.headers['content-type']).to.match(/json/);
    expect(res.status).to.be.equal(404);
  });
});
