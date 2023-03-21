'use strict';

const { cache } = require('../../config');

const ENGINE = cache?.engine || 'local';
const cacheEngine = require(`./${ENGINE}`);

if (typeof cacheEngine.get !== 'function') {
  throw new Error(`The 'get' function must be implemented in the '${ENGINE}' cache engine`);
}
if (typeof cacheEngine.set !== 'function') {
  throw new Error(`The 'set' function must be implemented in the '${ENGINE}' cache engine`);
}

module.exports = {
  get: cacheEngine.get,
  set: cacheEngine.set,
};