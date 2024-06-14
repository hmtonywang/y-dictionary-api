/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const crawler = require('dictionary-crawler');
const setup = require('./setup');
const { hmacSign } = require('../../../../utils');

const route = '/v1/words';
const getRoutePath = (word) => `${route}/${word}`;

describe(`Route Get ${getRoutePath(':word')}`, () => {
  let mockServer;

  before(async () => {
    mockServer = await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should respond 400 if the word param is empty', async () => {
    const routePath = getRoutePath(encodeURI(' '));
    const { hmacSignature: hmacSignatureConfig } = mockServer.config;
    const hmacSignature = hmacSign({
      method: 'GET',
      path: routePath,
      key: hmacSignatureConfig.apiKey,
      algorithm: hmacSignatureConfig.algorithm
    });
    const res = await mockServer.request
      .get(routePath)
      .set('X-API-KEY', hmacSignatureConfig.apiKey)
      .set('X-TIMESTAMP', hmacSignature.timestamp)
      .set('X-SIGNATURE', hmacSignature.signature);
    expect(res.status).to.be.equal(400);
  });

  it('should respond 200', async () => {
    const routePath = getRoutePath('test');
    const { hmacSignature: hmacSignatureConfig } = mockServer.config;
    const hmacSignature = hmacSign({
      method: 'GET',
      path: routePath,
      key: hmacSignatureConfig.apiKey,
      algorithm: hmacSignatureConfig.algorithm
    });
    const res = await mockServer.request
      .get(routePath)
      .set('X-API-KEY', hmacSignatureConfig.apiKey)
      .set('X-TIMESTAMP', hmacSignature.timestamp)
      .set('X-SIGNATURE', hmacSignature.signature);
    expect(res.status).to.be.equal(200);
  });

  it('should respond 429 if hit the rate limit', async () => {
    const routePath = getRoutePath('test');
    const { hmacSignature: hmacSignatureConfig, rateLimit } = mockServer.config;
    const { max } = rateLimit;

    for (let i = 0; i < max; i++) {
      const hit = i === max - 1;
      const hmacSignature = hmacSign({
        method: 'GET',
        path: routePath,
        key: hmacSignatureConfig.apiKey,
        algorithm: hmacSignatureConfig.algorithm
      });
      const res = await mockServer.request
        .get(routePath)
        .set('X-API-KEY', hmacSignatureConfig.apiKey)
        .set('X-TIMESTAMP', hmacSignature.timestamp)
        .set('X-SIGNATURE', hmacSignature.signature);
      if (hit) {
        expect(res.status).to.be.equal(429);
      } else {
        expect(res.status).to.be.equal(200);
      }
    }
  });

  it('should respond 200 after rate limit windowMs', function (done) {
    const routePath = getRoutePath('test');
    const { hmacSignature: hmacSignatureConfig, rateLimit } = mockServer.config;
    const { windowMs: delayMs } = rateLimit;
    this.timeout(delayMs + 1000);

    setTimeout(async () => {
      const hmacSignature = hmacSign({
        method: 'GET',
        path: routePath,
        key: hmacSignatureConfig.apiKey,
        algorithm: hmacSignatureConfig.algorithm
      });
      const res = await mockServer.request
        .get(routePath)
        .set('X-API-KEY', hmacSignatureConfig.apiKey)
        .set('X-TIMESTAMP', hmacSignature.timestamp)
        .set('X-SIGNATURE', hmacSignature.signature);
      expect(res.status).to.be.equal(200);
      done();
    }, delayMs);
  });

  it('should respond 500 if something wrong', async () => {
    const routePath = getRoutePath('test');
    const fakeFunc = () => {
      throw new Error();
    };
    const stub = sinon.stub(crawler.yahoo, 'crawl').callsFake(fakeFunc);
    const newMockServer = await setup();
    const { hmacSignature: hmacSignatureConfig } = newMockServer.config;

    const hmacSignature = hmacSign({
      method: 'GET',
      path: routePath,
      key: hmacSignatureConfig.apiKey,
      algorithm: hmacSignatureConfig.algorithm
    });
    const res = await mockServer.request
      .get(routePath)
      .set('X-API-KEY', hmacSignatureConfig.apiKey)
      .set('X-TIMESTAMP', hmacSignature.timestamp)
      .set('X-SIGNATURE', hmacSignature.signature);
    expect(stub.calledOnce).to.be.true;
    expect(res.status).to.be.equal(500);
  });
});
