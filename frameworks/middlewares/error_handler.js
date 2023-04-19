'use strict';

module.exports = ({ logger }) => {
  return (err, req, res, next) => {
    const errorLogger = logger('error handler middleware');
    err.traceId = req.traceId;
    errorLogger.error(err);
    res.fail(err.message, err.statusCode);
  };
};
