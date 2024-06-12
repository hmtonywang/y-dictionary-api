'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = function expressLoggerMiddleware ({ logger }) {
  return function (req, res, next) {
    const receiveTime = new Date();
    const id = uuidv4();
    req.id = id;
    logger.child({
      id,
      ip: req.ip,
      method: req.method,
      url: req.url
    }).info('req');
    res.on('finish', () => {
      const completeTime = new Date();
      const duration = completeTime - receiveTime;
      logger.child({
        id,
        statusCode: res.statusCode,
        contentLength: res.get('content-length'),
        duration
      }).info('res');
    });
    next();
  };
};
