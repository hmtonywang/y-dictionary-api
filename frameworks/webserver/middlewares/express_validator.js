'use strict';

const { validationResult } = require('express-validator');
const { BadRequest } = require('http-errors');

module.exports = function expressValidatorMiddleware (validations) {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      return next(BadRequest(error.msg));
    }
    next();
  };
};
