'use strict';

const bunyan = require('bunyan');

module.exports = (options) => {
  if (typeof options === 'string') {
    options = { name: options };
  }
  const settings = {
    src: false,
    streams: [
      {
        level: 'info',
        stream: process.stdout,
      },
    ],
    serializers: {
      req: (req) => {
        return {
          method: req.method,
          url: req.url,
          traceId: req.traceId,
          // headers: req.headers,
        };
      },
      res: (res) => {
        const obj = {
          statusCode: res.statusCode,
          traceId: res.traceId,
          // headers: res.getHeaders(),
        };
        if (res.statusCode >= 400) {
          obj.body = res.body;
        }
        return obj;
      },
      err: (err) => {
        return {
          name: err.name,
          message: err.message,
          stack: err.stack,
          traceId: err.traceId,
        };
      },
    },
    ...options,
  };
  return bunyan.createLogger(settings);
};