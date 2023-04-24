/* eslint-disable no-unused-expressions */
'use strict';

const { expect } = require('chai');
const hmac = require('../../../libs/hmac');

describe('libs/hmac', () => {
  it('should have a sign function', () => {
    expect(hmac).to.have.own.property('sign');
    expect(hmac.sign).to.be.a('function');
  });

  it('should return hash string', () => {
    const signature = hmac.sign('string', 'secret');
    expect(signature).to.be.a('string');
  });

  it('should be equal', () => {
    const signature1 = hmac.sign('string', 'secret', 'sha512');
    const signature2 = hmac.sign('string', 'secret', 'sha512');
    expect(signature1).to.be.equal(signature2);
    const signature3 = hmac.sign('data', 'ss', 'sha256');
    const signature4 = hmac.sign('data', 'ss', 'sha256');
    expect(signature3).to.be.equal(signature4);
  });

  it('should be different', () => {
    const signature1 = hmac.sign('string', 'secret', 'sha256');
    const signature2 = hmac.sign('string', 'secret', 'sha512');
    expect(signature1).to.be.not.equal(signature2);
    const signature3 = hmac.sign('data', 'secret', 'sha512');
    const signature4 = hmac.sign('string', 'secret', 'sha512');
    expect(signature3).to.be.not.equal(signature4);
    const signature5 = hmac.sign('data', 'ss', 'sha512');
    const signature6 = hmac.sign('data', 'secret', 'sha512');
    expect(signature5).to.be.not.equal(signature6);
  });
});
