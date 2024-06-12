'use strict';

const { param } = require('express-validator');
const expressValidatorMiddleware = require('../../middlewares/express_validator');
const wordController = require('../../../../adapters/controllers/word');
const wordRedisCacheRepositoryInterface = require('../../../../application/repositories/word_redis_cache');
const redisCacheRepositoryImpl = require('../../../database/redis/repositories/redis_cache');
const dictionaryServiceInterface = require('../../../../application/services/dictionary');
const dictionaryServiceImpl = require('../../../services/dictionary');
const redisCachingMiddleware = require('../../middlewares/redis_caching');
const rateLimitInterface = require('../../../../application/services/rate_limit');
const redisRateLimitService = require('../../../services/redis_rate_limit');
const redisRateLimitRepositoryInterface = require('../../../../application/repositories/redis_rate_limit');
const redisRateLimitRepositoryImpl = require('../../../database/redis/repositories/redis_rate_limit');
const rateLimitMiddleware = require('../../middlewares/rate_limit');

module.exports = ({
  express,
  logger,
  redisClient,
  config
}) => {
  const router = express.Router();
  const rateLimitImpl = redisRateLimitService({
    redisRepositoryInterface: redisRateLimitRepositoryInterface,
    redisRepositoryImpl: redisRateLimitRepositoryImpl,
    redisClient
  });
  const controller = wordController({
    dictionaryServiceInterface,
    dictionaryServiceImpl,
    config,
    logger
  });

  router
    .route('/:word')
    .get(
      expressValidatorMiddleware([
        param('word').trim().escape().notEmpty()
      ]),
      rateLimitMiddleware({
        rateLimitInterface,
        rateLimitImpl,
        config: config.rateLimit
      }),
      redisCachingMiddleware({
        redisRepositoryInterface: wordRedisCacheRepositoryInterface,
        redisRepositoryImpl: redisCacheRepositoryImpl,
        redisClient,
        getCacheKey: (req) => `word_${req.params.word}`,
        logger
      }),
      controller.lookUpWord
    );

  return router;
};
