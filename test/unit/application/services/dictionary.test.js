/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const dictionaryService = require('../../../../application/services/dictionary');

describe('dictionary service', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if service is not provided', () => {
    expect(() => dictionaryService()).to.throw();
  });

  it('should throw an error if service.lookup is not provided', () => {
    const service = {};
    expect(() => dictionaryService(service)).to.throw();
  });

  it('should return an object with a lookup function', () => {
    const service = { lookup: sinon.fake() };

    const result = dictionaryService(service);

    expect(result).has.property('lookup');
    expect(result.lookup).to.be.a('function');
  });

  it('should call service.lookup', async () => {
    const word = 'word';
    const service = { lookup: sinon.fake() };

    const result = dictionaryService(service);
    await result.lookup(word);

    expect(service.lookup.calledOnceWithExactly(word)).to.be.true;
  });
});
