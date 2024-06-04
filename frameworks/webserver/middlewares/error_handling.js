'use strict';

const createHttpError = require('http-errors');
const { InternalServerError } = createHttpError;

module.exports = function errorHandlingMiddleware ({ logger, config }) {
  return function (err, req, res, next) {
    const httpError = createHttpError(err.status || err.statusCode || InternalServerError().status);
    if (httpError.status >= 500) {
      logger.child({ id: req.id }).error(err);
    }
    const message = config.env === 'production'
      ? httpError.message
      : err.customMessage || err.message || httpError.message;
    const data = { status: httpError.status, message };
    return res
      .status(httpError.status)
      .json(data);
  };
};
