'use strict';

const hmac = require('../../libs/hmac');

module.exports = ({ config }) => {
  const expiry = parseInt(config.auth.expiry) * 1000;

  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const apiKey = req.header('X-API-KEY');
    const signature = req.header('X-SIGNATURE');
    const timestamp = req.header('X-TIMESTAMP');
    const expired = (new Date().getTime() - timestamp) > expiry;
    if (
      apiKey !== config.auth.apiKey ||
      !signature ||
      !timestamp ||
      expired
    ) {
      return res.failUnauthorized();
    }
    const str = `${req.method}&${req.originalUrl}&${timestamp}`;
    const hash = hmac.sign(str, apiKey);
    if (hash !== signature) {
      return res.failUnauthorized();
    }
    next();
  };
};
