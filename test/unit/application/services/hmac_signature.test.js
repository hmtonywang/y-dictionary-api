/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const hmacSignatureService = require('../../../../application/services/hmac_signature');

describe('hmac signature service', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if service is not provided', () => {
    expect(() => hmacSignatureService()).to.throw();
  });

  it('should throw an error if service.sign is not provided', () => {
    const service = {};
    expect(() => hmacSignatureService(service)).to.throw();
  });

  it('should return an object with a sign function', () => {
    const service = { sign: sinon.fake() };

    const result = hmacSignatureService(service);

    expect(result).has.property('sign');
    expect(result.sign).to.be.a('function');
  });

  it('should call service.sign', async () => {
    const str = 'str';
    const secret = 'secret';
    const algorithm = 'algorithm';
    const service = { sign: sinon.fake() };

    const result = hmacSignatureService(service);
    await result.sign(str, secret, algorithm);

    expect(service.sign.calledOnceWithExactly(str, secret, algorithm)).to.be.true;
  });
});
