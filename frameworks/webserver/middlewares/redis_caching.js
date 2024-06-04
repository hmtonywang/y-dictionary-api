'use strict';

module.exports = function redisCachingMiddleware ({
  redisRepositoryInterface,
  redisRepositoryImpl,
  redisClient,
  getCacheKey,
  cacheKey,
  logger
}) {
  const redisCachingRepository = redisRepositoryInterface(redisRepositoryImpl(redisClient));
  return async function getFromCache (req, res, next) {
    const key = (typeof getCacheKey === 'function' ? getCacheKey(req) : cacheKey) || '';
    try {
      const data = await redisCachingRepository.get(key);
      if (data) {
        return res.json(JSON.parse(data));
      }
    } catch (error) {
      logger.error({ error }, 'Get from cache failed');
    }
    req.setToCache = async function setToCache (data, expireTimeSec) {
      try {
        await redisCachingRepository.set(key, JSON.stringify(data), expireTimeSec);
      } catch (error) {
        logger.error({ error }, 'Set to cache failed');
      }
    };
    return next();
  };
};
