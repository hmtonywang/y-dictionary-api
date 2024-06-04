'use strict';

module.exports = function redisRateLimitRepository (repository) {
  if (typeof repository.sendCommand !== 'function') throw new TypeError('Input redis repository must implement the "sendCommand" function');
  const sendCommand = (command, ...args) => repository.sendCommand(command, ...args);
  return {
    sendCommand
  };
};
