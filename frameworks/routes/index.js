'use strict';

const express = require('express');
const v1 = require('./v1');

module.exports = (options) => {
  const router = express.Router();

  router.use('/v1', v1(options));
  router.all('*', (req, res) => {
    res.notFound();
  });

  return router;
};
