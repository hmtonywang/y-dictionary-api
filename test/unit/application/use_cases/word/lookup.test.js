/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const lookup = require('../../../../../application/use_cases/word/lookup');

describe('lookup word use case', () => {
  const word = 'word';
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if service is not provided', () => {
    expect(() => lookup(word)).to.throw();
  });

  it('should throw an error if service.lookup is not provided', () => {
    const service = {};
    expect(() => lookup(word, service)).to.throw();
  });

  it('should call service.lookup', async () => {
    const service = { lookup: sinon.fake() };

    lookup(word, service);

    expect(service.lookup.calledOnceWithExactly(word)).to.be.true;
  });
});
