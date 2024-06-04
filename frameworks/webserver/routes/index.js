'use strict';

const { NotFound } = require('http-errors');
const v1 = require('./v1');

module.exports = function routers ({
  app,
  express,
  redisClient,
  config,
  logger
}) {
  const router = express.Router();

  router.use('/v1', v1({ express, redisClient, config, logger }));
  router.all('*', (req, res, next) => {
    return next(NotFound());
  });
  app.use(router);
};
