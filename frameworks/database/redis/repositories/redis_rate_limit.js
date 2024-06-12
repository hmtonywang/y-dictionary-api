'use strict';

module.exports = function redisRateLimitRepository (redisClient) {
  if (typeof redisClient.send_command !== 'function') throw new TypeError('Input redis client must implement the "send_command" function');
  const sendCommand = (command, ...args) => {
    return redisClient.send_command(command, ...args);
  };
  return {
    sendCommand
  };
};
