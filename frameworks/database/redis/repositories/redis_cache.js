'use strict';

module.exports = function redisCacheRepository (redisClient) {
  if (typeof redisClient.set !== 'function') throw new TypeError('Input redis client must implement the "set" function');
  if (typeof redisClient.get !== 'function') throw new TypeError('Input redis client must implement the "get" function');
  const set = (key, data, expireTimeSec) => {
    return redisClient.set(`cache:${key}`, data, 'EX', expireTimeSec);
  };
  const get = (key) => {
    return redisClient.get(`cache:${key}`);
  };
  return {
    set,
    get
  };
};
