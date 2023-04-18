'use strict';

const express = require('express');
const api = require('./api');

module.exports = ({ config, logger }) => {
  const router = express.Router();

  router.use(`/${config.version}`, api({ config, logger }));
  router.all('*', (req, res) => {
    res.failNotFound();
  });

  return router;
};