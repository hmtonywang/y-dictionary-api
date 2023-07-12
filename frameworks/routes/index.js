'use strict';

const express = require('express');
const api = require('./api');

module.exports = (options) => {
  const { config } = options;
  const router = express.Router();

  router.use(`/${config.version}`, api(options));
  router.all('*', (req, res) => {
    res.notFound();
  });

  return router;
};
