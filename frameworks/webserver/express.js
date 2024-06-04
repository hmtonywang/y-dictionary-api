'use strict';

const helmet = require('helmet');
const compression = require('compression');
const expressLoggerMiddleware = require('./middlewares/express_logger');
const hmacSignatureMiddleware = require('./middlewares/hmac_signature');
const hmacSignatureInterface = require('../../application/services/hmac_signature');
const hmacSignatureImpl = require('../services/hmac_signature');

module.exports = function expressConfig ({
  app,
  config,
  logger
}) {
  app.use(helmet());
  app.use(compression());
  app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Accept,X-API-KEY,X-SIGNATURE,X-TIMESTAMP');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    next();
  });
  app.use(expressLoggerMiddleware({ logger }));
  app.use(hmacSignatureMiddleware({
    hmacSignatureInterface,
    hmacSignatureImpl,
    config: config.hmacSignature
  }));
};
