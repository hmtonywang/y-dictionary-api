'use strict';

const express = require('express');
const { param } = require('express-validator');
const validationResultMiddleware = require('../../middlewares/validation_result');
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
      param('word').trim().escape().notEmpty(),
      validationResultMiddleware,
      redis
        ? redisCacheMiddleware({ redis, ex: 3 * 60 * 60, logger })
        : cacheMiddleware({ cacheImpl: localCache, logger }),
      controller.getMeaning
    );

  return router;
};
