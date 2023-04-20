'use strict';

module.exports = (options) => {
  const capacity = options?.capacity || 100;
  const expiry = options?.expiry || 3600 * 1000;
  const map = new Map();

  const get = (key) => {
    if (!map.has(key)) {
      return null;
    }
    const expiration = new Date().getTime() - expiry;
    const [value, timestamp] = map.get(key);
    const isExpired = timestamp < expiration;
    if (isExpired) {
      map.delete(key);
      return null;
    }
    return value;
  };

  const set = (key, value) => {
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
