'use strict';

const moment = require('moment');
const { cache } = require('../../config');

const CAPACITY = cache?.options?.capacity || 100;
const EXPIRATION = cache?.options?.expiration || 3600;
const map = new Map();

const close = () => {
  map.clear();
};

const get = (key) => {
  if (!map.has(key)) {
    return;
  }
  const expiration = moment().subtract(EXPIRATION, 'seconds').unix();
  const [value, timestamp] = map.get(key);
  if (timestamp < expiration) {
    map.delete(key);
    return;
  }
  return value;
};

const set = (key, value) => {
  const timestamp = moment().unix();
  if (map.size >= CAPACITY) {
    map.delete(map.keys().next().value);
  }
  map.set(key, [value, timestamp]);
};

module.exports = {
  close,
  get,
  set,
};