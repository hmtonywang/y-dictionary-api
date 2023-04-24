/* eslint-disable no-unused-expressions */
'use strict';

const sandbox = require('sinon').createSandbox();
const { expect } = require('chai');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const ydCrawler = require('../../../libs/yahoo_dictionary_crawler');
const ydHTML = fs.readFileSync(
  path.resolve(__dirname, '../../test_data/yahoo_dictionary.html')
);
const ydNotFoundHTML = fs.readFileSync(
  path.resolve(__dirname, '../../test_data/yahoo_dictionary_not_found.html')
);
const googleHTML = fs.readFileSync(
  path.resolve(__dirname, '../../test_data/google.html')
);

describe('libs/yahoo_dictionary_crawler', () => {
  it('should throw an error', () => {
    expect(() => ydCrawler()).to.throw();
    expect(() => ydCrawler({ key: 'value' })).to.throw();
    expect(() => ydCrawler('')).to.throw();
    expect(() => ydCrawler('  ')).to.throw();
  });

  it('should return a getData function', () => {
    const crawler = ydCrawler('test');
    expect(crawler).to.have.own.property('getData');
    expect(crawler.getData).to.be.a('function');
  });

  it('should throw an error', async () => {
    const stub = sandbox.stub(axios, 'get').throws();
    const crawler = ydCrawler('test');
    let err;
    try {
      await crawler.getData();
    } catch (error) {
      err = error;
    }
    expect(err).to.be.instanceOf(Error);
    expect(stub.calledOnce);
    stub.restore();
  });

  it('should return data', async () => {
    const stub = sandbox.stub(axios, 'get').returns({ data: ydHTML });
    const crawler = ydCrawler('test');
    const data = await crawler.getData();
    expect(stub.calledOnce);
    expect(data).to.have.own.property('main');
    expect(data.main).to.have.own.property('title');
    expect(data.main).to.have.own.property('phonetic');
    expect(data.main).to.have.own.property('pronunciations');
    expect(data.main).to.have.own.property('explanations');
    expect(data).to.have.own.property('notes');
    expect(data).to.have.own.property('secondary');
    expect(data).to.have.own.property('more');
    stub.restore();
  });

  it('should return \'Not Found\'', async () => {
    const stub = sandbox.stub(axios, 'get').returns({ data: ydNotFoundHTML });
    const crawler = ydCrawler('test');
    const data = await crawler.getData();
    expect(stub.calledOnce);
    expect(data).to.be.equal('Not Found');
    stub.restore();
  });

  it('should return \'Not Found\'', async () => {
    const stub = sandbox.stub(axios, 'get').returns({ data: googleHTML });
    const crawler = ydCrawler('test');
    const data = await crawler.getData();
    expect(stub.calledOnce);
    expect(data).to.be.equal('Not Found');
    stub.restore();
  });
});
