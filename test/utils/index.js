'use strict';

const moment = require('moment');
const hmacSignatureImpl = require('../../frameworks/services/hmac_signature');

module.exports.hmacSign = function hmacSign ({
  method,
  path,
  key,
  algorithm
}) {
  const timestamp = moment().valueOf();
  const str = `${method}&${path}&${timestamp}`;
  const signature = hmacSignatureImpl().sign(
    str,
    key,
    algorithm
  );
  return {
    key,
    timestamp,
    signature
  };
};

module.exports.flushAllRedisData = async function flushAllRedisData (redisClient) {
  const keys = await redisClient.keys('*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};