/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const redisRateLimitRepository = require('../../../../application/repositories/redis_rate_limit');

describe('redis rate limit repository', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if repository is not provided', () => {
    expect(() => redisRateLimitRepository()).to.throw();
  });

  it('should throw an error if repository.sendCommand is not provided', () => {
    const repository = {};
    expect(() => redisRateLimitRepository(repository)).to.throw();
  });

  it('should return an object with sendCommand function', () => {
    const repository = { sendCommand: sinon.fake() };

    const result = redisRateLimitRepository(repository);

    expect(result).has.property('sendCommand');
    expect(result.sendCommand).to.be.a('function');
  });

  it('should send command from repository', async () => {
    const command = 'command';
    const arg1 = 'arg1';
    const arg2 = 'arg2';
    const repository = { sendCommand: sinon.fake() };

    const repo = redisRateLimitRepository(repository);
    repo.sendCommand(command, arg1, arg2);

    expect(repository.sendCommand.calledOnceWithExactly(command, arg1, arg2)).to.be.true;
  });
});
