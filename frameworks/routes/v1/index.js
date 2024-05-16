'use strict';

const express = require('express');
const word = require('./word');

module.exports = (options) => {
  const router = express.Router();

  router.use('/words', word(options));

  return router;
};
