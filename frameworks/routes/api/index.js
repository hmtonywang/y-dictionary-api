'use strict';

const express = require('express');
const word = require('./word');

module.exports = ({ config, logger }) => {
  const router = express.Router();

  router.use('/words', word({ config, logger }));

  return router;
};
