/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const wordController = require('../../../../adapters/controllers/word');

describe('word controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if options is not provided', () => {
    expect(() => wordController()).to.throw();
  });

  it('should throw an error if options.dictionaryServiceInterface is not provided', () => {
    const options = {
      dictionaryServiceImpl: sinon.fake()
    };
    expect(() => wordController(options)).to.throw();
  });

  it('should throw an error if options.dictionaryServiceInterface is not a function', () => {
    const options = {
      dictionaryServiceInterface: {},
      dictionaryServiceImpl: sinon.fake()
    };
    expect(() => wordController(options)).to.throw();
  });

  it('should throw an error if options.dictionaryServiceImpl is not provided', () => {
    const options = {
      dictionaryServiceInterface: sinon.fake()
    };
    expect(() => wordController(options)).to.throw();
  });

  it('should throw an error if options.dictionaryServiceImpl is not a function', () => {
    const options = {
      dictionaryServiceInterface: sinon.fake(),
      dictionaryServiceImpl: {}
    };
    expect(() => wordController(options)).to.throw();
  });

  it('should return an object with a lookUpWord function', () => {
    const options = {
      dictionaryServiceInterface: sinon.fake(),
      dictionaryServiceImpl: sinon.fake()
    };
    const controller = wordController(options);

    expect(controller).has.property('lookUpWord');
    expect(controller.lookUpWord).to.be.a('function');
  });

  it('should call next() with an error if dictionaryServiceInterface does not return an object with a lookup function', async () => {
    const options = {
      dictionaryServiceInterface: sinon.fake(),
      dictionaryServiceImpl: sinon.fake()
    };
    const controller = wordController(options);
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    await controller.lookUpWord(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('error');
  });

  it('should call fakeService.lookup() with req.params.word', async () => {
    const fakeService = { lookup: sinon.fake() };
    const options = {
      dictionaryServiceInterface: sinon.fake.returns(fakeService),
      dictionaryServiceImpl: sinon.fake()
    };
    const controller = wordController(options);
    const word = 'word';
    const req = httpMocks.createRequest({
      params: { word }
    });
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    await controller.lookUpWord(req, res, next);

    expect(fakeService.lookup.calledOnceWithExactly(word)).to.be.true;
  });

  it('should call res.json() with expected result', async () => {
    const expectedResult = 'expected result';
    const fakeService = { lookup: sinon.fake.returns(expectedResult) };
    const options = {
      dictionaryServiceInterface: sinon.fake.returns(fakeService),
      dictionaryServiceImpl: sinon.fake()
    };
    const controller = wordController(options);
    const word = 'word';
    const req = httpMocks.createRequest({
      params: { word }
    });
    req.setToCache = sinon.fake();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    await controller.lookUpWord(req, res, next);

    expect(res._isEndCalled()).to.be.true;
    expect(res._isJSON()).to.be.true;
    expect(res._getJSONData()).to.be.equal(expectedResult);
  });

  it('should call req.setToCache() if it is provided', async () => {
    const expectedResult = 'expected result';
    const fakeService = { lookup: sinon.fake.returns(expectedResult) };
    const options = {
      dictionaryServiceInterface: sinon.fake.returns(fakeService),
      dictionaryServiceImpl: sinon.fake()
    };
    const controller = wordController(options);
    const word = 'word';
    const req = httpMocks.createRequest({
      params: { word }
    });
    req.setToCache = sinon.fake();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    await controller.lookUpWord(req, res, next);

    expect(req.setToCache.calledOnce).to.be.true;
    expect(req.setToCache.firstCall.firstArg).to.be.equal(expectedResult);
  });

  it('should call next() with an error if something wrong', async () => {
    const error = new Error('something wrong');
    const fakeService = { lookup: sinon.fake.throws(error) };
    const options = {
      dictionaryServiceInterface: sinon.fake.returns(fakeService),
      dictionaryServiceImpl: sinon.fake()
    };
    const controller = wordController(options);
    const word = 'word';
    const req = httpMocks.createRequest({
      params: { word }
    });
    req.setToCache = sinon.fake();
    const res = httpMocks.createResponse({ req });
    const next = sinon.fake();
    await controller.lookUpWord(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.firstArg).to.be.an('error');
    expect(next.calledOnceWithExactly(error)).to.be.true;
  });
});
