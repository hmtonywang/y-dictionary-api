/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const redisRateLimitRepository = require('../../../../../../frameworks/database/redis/repositories/redis_rate_limit');

describe('redis rate limit repository', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if Redis client is not provided', async () => {
    expect(() => redisRateLimitRepository()).to.throw();
  });

  it('should throw an error if Redis client.send_command is not provided', async () => {
    const redisClient = {};
    expect(() => redisRateLimitRepository(redisClient)).to.throw();
  });

  it('should return an object with a sendCommand function', async () => {
    const redisClient = { send_command: sinon.fake() };
    const repo = redisRateLimitRepository(redisClient);

    expect(repo).has.property('sendCommand');
    expect(repo.sendCommand).to.be.a('function');
  });

  it('should send command from Redis client', async () => {
    const command = 'command';
    const arg1 = 'arg1';
    const arg2 = 'arg2';
    const redisClient = { send_command: sinon.fake() };

    const repo = redisRateLimitRepository(redisClient);
    repo.sendCommand(command, arg1, arg2);

    expect(redisClient.send_command.calledOnceWithExactly(command, arg1, arg2)).to.be.true;
  });
});
