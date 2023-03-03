'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const apiRateLimitConfig = require('../../config').rateLimit.api;
const lookup = require('./lookup');

module.exports = {
  setup: (app) => {
    const router = express.Router();

    router.use('/lookup', lookup);
    router.all('*', (req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });
    if (apiRateLimitConfig.enable) {
      app.use(
        '/api',
        express.json(),
        rateLimit(apiRateLimitConfig.options),
        router,
      );
    } else {
      app.use('/api', express.json(), router);
    }
  },
};