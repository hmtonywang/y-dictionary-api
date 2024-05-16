'use strict';

const { validationResult } = require('express-validator');

module.exports = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      return res.validationError(error.msg);
    }
    next();
  };
};
