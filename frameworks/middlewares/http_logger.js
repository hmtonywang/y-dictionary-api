'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = (logger) => {
  const reqLogger = logger({ name: 'req', src: false });
  const resLogger = logger({ name: 'res', src: false });
  return (req, res, next) => {
    const startTime = new Date();
    const traceId = uuidv4();
    req.traceId = traceId;
    res.traceId = traceId;
    req.remoteAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // Log requests
    reqLogger.info({ req });
  
    // Override res.send to set res.body before send
    const originalSend = res.send;
    res.send = function newSend(body) {
      res.body = body;
      originalSend.call(this, body);
    };
    res.on('finish', () => {
      const endTime = new Date();
      // Log responses
      resLogger.child({ duration: endTime - startTime }).info({ res });
    })
    next();
  };
};