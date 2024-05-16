'use strict';

const express = require('express');
const { param } = require('express-validator');
const expressValidatorMiddleware = require('../../middlewares/express_validator');
const wordController = require('../../controllers/word');
const localCache = require('../../../libs/local_cache')();
const cacheMiddleware = require('../../middlewares/cache');
const redisCacheMiddleware = require('../../middlewares/redis_cache');

module.exports = ({ config, logger, redis }) => {
  const router = express.Router();
  const controller = wordController({ config, logger });

  router
    .route('/:word')
    .get(
      expressValidatorMiddleware([
        param('word').trim().escape().notEmpty()
      ]),
      redis
        ? redisCacheMiddleware({ redis, ex: 3 * 60 * 60, logger })
        : cacheMiddleware({ cacheImpl: localCache, logger }),
      controller.getMeaning
    );

  return router;
};
