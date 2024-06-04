'use strict';

const { BadRequest } = require('http-errors');
const moment = require('moment');

const error = BadRequest();

module.exports = function hmacSignatureMiddleware ({
  hmacSignatureInterface,
  hmacSignatureImpl,
  config
}) {
  const hmacSignatureService = hmacSignatureInterface(hmacSignatureImpl());
  const expiry = parseInt(config.expireTimeSec) * 1000;
  const { apiKey, algorithm } = config;

  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const headerApiKey = req.header('X-API-KEY');
    const isValidApiKey = headerApiKey === apiKey;
    if (!isValidApiKey) {
      return next(error);
    }
    const headerTimestamp = req.header('X-TIMESTAMP');
    if (!headerTimestamp) {
      return next(error);
    }
    const time = moment(parseInt(headerTimestamp));
    const isValidTimestamp = /^\d+$/.test(headerTimestamp) && time.isValid();
    if (!isValidTimestamp) {
      return next(error);
    }
    const now = moment().valueOf();
    const timestamp = time.valueOf();
    const diff = now - timestamp;
    const isFuture = diff < 0;
    const isExpired = diff > expiry;
    if (isFuture || isExpired) {
      return next(error);
    }
    const headerSignature = req.header('X-SIGNATURE');
    if (!headerSignature) {
      return next(error);
    }
    const str = `${req.method}&${req.originalUrl}&${headerTimestamp}`;
    const signature = hmacSignatureService.sign(str, apiKey, algorithm);
    if (signature !== headerSignature) {
      return next(error);
    }
    next();
  };
};
