'use strict';

module.exports = function wordRedisCacheRepository (repository) {
  if (typeof repository.get !== 'function') throw new TypeError('Input redis repository must implement the "get" function');
  if (typeof repository.set !== 'function') throw new TypeError('Input redis repository must implement the "set" function');
  const set = (key, value, expireTimeSec) => repository.set(key, value, expireTimeSec);
  const get = (key) => repository.get(key);
  return {
    set,
    get
  };
};
