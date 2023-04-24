'use strict';

const RESPONSE = {
  OK: {
    status: 200,
    message: 'OK'
  },
  BAD_REQUEST: {
    status: 400,
    message: 'Bad Request'
  },
  UNAUTHORIZED: {
    status: 401,
    message: 'Unauthorized'
  },
  NOT_FOUND: {
    status: 404,
    message: 'Not Found'
  },
  TOO_MANY_REQUESTS: {
    status: 429,
    message: 'Too Many Requests'
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'Internal Server Error'
  }
};

module.exports = (req, res, next) => {
  res.respond = (data = null, status = RESPONSE.OK.status, message = RESPONSE.OK.message, moreInfo = {}) => {
    const response = {
      status,
      message,
      ...moreInfo
    };
    if (data) {
      response.data = data;
    }

    res
      .status(status)
      .json(response);
  };

  res.fail = (message = RESPONSE.INTERNAL_SERVER_ERROR.message, status = RESPONSE.INTERNAL_SERVER_ERROR.status, code = null) => {
    const info = {
      error: code || status.toString()
    };

    res.respond(null, status, message, info);
  };

  res.unauthorized = (message = RESPONSE.UNAUTHORIZED.message, code) => {
    res.fail(message, RESPONSE.UNAUTHORIZED.status, code);
  };

  res.notFound = (message = RESPONSE.NOT_FOUND.message, code) => {
    res.fail(message, RESPONSE.NOT_FOUND.status, code);
  };

  res.validationError = (message = RESPONSE.BAD_REQUEST.message, code) => {
    res.fail(message, RESPONSE.BAD_REQUEST.status, code);
  };

  res.tooManyRequests = (message = RESPONSE.TOO_MANY_REQUESTS.message, code) => {
    res.fail(message, RESPONSE.TOO_MANY_REQUESTS.status, code);
  };

  res.internalServerError = (message = RESPONSE.INTERNAL_SERVER_ERROR.message, code) => {
    res.fail(message, RESPONSE.INTERNAL_SERVER_ERROR.status, code);
  };

  next();
};
module.exports.RESPONSE = RESPONSE;
