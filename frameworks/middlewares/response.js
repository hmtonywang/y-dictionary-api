'use strict';

const responseCodes = {
  ok: {
    status: 200,
    message: 'OK',
  },
  badRequest: {
    status: 400,
    message: 'Bad Request',
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized',
  },
  notFound: {
    status: 404,
    message: 'Not Found',
  },
  tooManyRequests: {
    status: 429,
    message: 'Too Many Requests',
  },
  internalServerError: {
    status: 500,
    message: 'Internal Server Error',
  },
};

module.exports = (req, res, next) => {
  res.respond = (data = null, status = responseCodes.ok.status, message = responseCodes.ok.message, moreInfo = {}) => {
    const response = {
      status,
      message,
      ...moreInfo,
    };
    if (data) {
      response.data = data;
    }

    res
      .status(status)
      .json(response);
  };

  res.fail = (message = responseCodes.internalServerError.message, status = responseCodes.internalServerError.status, code = null) => {
    const info = {
      error: code || status.toString(),
    };

    res.respond(null, status, message, info);
  };

  res.failUnauthorized = (message = responseCodes.unauthorized.message, code) => {
    res.fail(message, responseCodes.unauthorized.status, code);
  };

  res.failNotFound = (message = responseCodes.notFound.message, code) => {
    res.fail(message, responseCodes.notFound.status, code);
  };

  res.failValidationError = (message = responseCodes.badRequest.message, code) => {
    res.fail(message, responseCodes.badRequest.status, code);
  };

  res.failTooManyRequests = (message = responseCodes.tooManyRequests.message, code) => {
    res.fail(message, responseCodes.tooManyRequests.status, code);
  };

  res.failServerError = (message = responseCodes.internalServerError.message, code) => {
    res.fail(message, responseCodes.internalServerError.status, code);
  };

  next();
};