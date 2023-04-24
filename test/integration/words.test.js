/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const supertest = require('supertest');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const config = require('../../config');
const app = require('../../app');
const request = supertest(app);
const hmac = require('../../libs/hmac');
const ydHTML = fs.readFileSync(
  path.resolve(__dirname, '../test_data/yahoo_dictionary.html')
);

describe('Words endpoint', () => {
  it('should respond 401', async () => {
    const url = `/${config.version}/words/test`;
    const res = await request.get(url);
    expect(res.status).to.be.equal(401);
  });

  it('should respond 400', async () => {
    const url = `/${config.version}/words/${encodeURI(' ')}`;
    const timestamp = new Date().getTime();
    const signature = hmac.sign(`GET&${url}&${timestamp}`, config.auth.apiKey, config.auth.algorithm);
    const res = await request
      .get(url)
      .set('X-API-KEY', config.auth.apiKey)
      .set('X-TIMESTAMP', timestamp)
      .set('X-SIGNATURE', signature);
    expect(res.status).to.be.equal(400);
  });

  it('should respond 404', async () => {
    const url = `/${config.version}/test`;
    const timestamp = new Date().getTime();
    const signature = hmac.sign(`GET&${url}&${timestamp}`, config.auth.apiKey, config.auth.algorithm);
    const res = await request
      .get(url)
      .set('X-API-KEY', config.auth.apiKey)
      .set('X-TIMESTAMP', timestamp)
      .set('X-SIGNATURE', signature);
    expect(res.status).to.be.equal(404);
  });

  it('should respond 200', async () => {
    const stub = sandbox.stub(axios, 'get').returns({ data: ydHTML });
    const url = `/${config.version}/words/test`;
    const timestamp = new Date().getTime();
    const signature = hmac.sign(`GET&${url}&${timestamp}`, config.auth.apiKey, config.auth.algorithm);
    const res = await request
      .get(url)
      .set('X-API-KEY', config.auth.apiKey)
      .set('X-TIMESTAMP', timestamp)
      .set('X-SIGNATURE', signature);
    expect(res.status).to.be.equal(200);
    expect(res.body.data).to.have.own.property('main');
    expect(res.body.data.main).to.have.own.property('title');
    expect(res.body.data.main).to.have.own.property('phonetic');
    expect(res.body.data.main).to.have.own.property('pronunciations');
    expect(res.body.data.main).to.have.own.property('explanations');
    expect(res.body.data).to.have.own.property('notes');
    expect(res.body.data).to.have.own.property('secondary');
    expect(res.body.data).to.have.own.property('more');
    stub.restore();
  });

  it('should respond 429', async () => {
    const url = `/${config.version}/words/test`;
    const timestamp = new Date().getTime();
    const signature = hmac.sign(`GET&${url}&${timestamp}`, config.auth.apiKey, config.auth.algorithm);
    const res = await request
      .get(url)
      .set('X-API-KEY', config.auth.apiKey)
      .set('X-TIMESTAMP', timestamp)
      .set('X-SIGNATURE', signature);
    expect(res.status).to.be.equal(429);
  });

  it('should respond 500', () => {
    const stub = sandbox.stub(axios, 'get').throws();
    const url = `/${config.version}/words/test`;
    setTimeout(async () => {
      const timestamp = new Date().getTime();
      const signature = hmac.sign(`GET&${url}&${timestamp}`, config.auth.apiKey, config.auth.algorithm);
      const res = await request
        .get(url)
        .set('X-API-KEY', config.auth.apiKey)
        .set('X-TIMESTAMP', timestamp)
        .set('X-SIGNATURE', signature);
      expect(res.status).to.be.equal(500);
      stub.restore();
    }, 5000);
  });

  after(() => {
    process.exit();
  });
});
