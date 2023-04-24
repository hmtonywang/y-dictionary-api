'use strict';

const moment = require('moment');
const hmac = require('../../libs/hmac');

module.exports = ({ config }) => {
  const expiry = parseInt(config.auth.expiry) * 1000;
  const { apiKey, algorithm } = config.auth;

  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const headerApiKey = req.header('X-API-KEY');
    const isValidApiKey = headerApiKey === apiKey;
    if (!isValidApiKey) {
      return res.unauthorized();
    }
    const headerTimestamp = req.header('X-TIMESTAMP');
    if (!headerTimestamp) {
      return res.unauthorized();
    }
    const time = moment(parseInt(headerTimestamp));
    const isValidTimestamp = /^\d+$/.test(headerTimestamp) && time.isValid();
    if (!isValidTimestamp) {
      return res.unauthorized();
    }
    const now = moment().valueOf();
    const timestamp = time.valueOf();
    const diff = now - timestamp;
    const isFuture = diff <= 0;
    const isExpired = diff > expiry;
    if (isFuture || isExpired) {
      return res.unauthorized();
    }
    const headerSignature = req.header('X-SIGNATURE');
    if (!headerSignature) {
      return res.unauthorized();
    }
    const str = `${req.method}&${req.originalUrl}&${headerTimestamp}`;
    const signature = hmac.sign(str, apiKey, algorithm);
    if (signature !== headerSignature) {
      return res.unauthorized();
    }
    next();
  };
};
