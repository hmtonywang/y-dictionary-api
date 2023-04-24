'use strict';

module.exports = (options) => {
  const capacity = options?.capacity || 100;
  const expiry = options?.expiry || 3600 * 1000;
  const map = new Map();

  const get = (key = '') => {
    if (!key.trim() || typeof key !== 'string') {
      throw new TypeError('\'key\' requires a non-empty string');
    }
    if (!map.has(key)) {
      return null;
    }
    const now = new Date().getTime();
    const expiration = now - expiry;
    const [value, timestamp] = map.get(key);
    const isExpired = timestamp < expiration;
    if (isExpired) {
      map.delete(key);
      return null;
    }
    return value;
  };

  const set = (key = '', value) => {
    if (!key.trim() || typeof key !== 'string') {
      throw new TypeError('\'key\' requires a non-empty string');
    }
    const timestamp = new Date().getTime();
    const isFull = map.size >= capacity;
    if (isFull) {
      map.delete(map.keys().next().value);
    }
    map.set(key, [value, timestamp]);
  };
  return {
    get,
    set
  };
};
