'use strict';

const config = require('../config');

const CAPACITY = config?.cache?.options?.capacity || 100;
const EXPIRATION = config?.cache?.options?.expiration || 3600000;
const map = new Map();

module.exports.get = (key) => {
  if (!map.has(key)) {
    return;
  }
  const expiration = new Date().getTime() - EXPIRATION;
  const [value, timestamp] = map.get(key);
  if (timestamp < expiration) {
    map.delete(key);
    return;
  }
  return value;
};

module.exports.set = (key, value) => {
  const timestamp = new Date().getTime();
  if (map.size >= CAPACITY) {
    map.delete(map.keys().next().value);
  }
  map.set(key, [value, timestamp]);
};
