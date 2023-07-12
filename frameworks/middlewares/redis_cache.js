'use strict';

module.exports = ({ redis, logger, ex }) => {
  const cacheLogger = logger('redis cache middleware');

  const getFromCache = async (req, res, next) => {
    const { method, originalUrl } = req;
    const key = `cache:${method}_${originalUrl}`;
    try {
      const data = await redis.get(key);
      if (data) {
        if (typeof data === 'string') {
          return res.status(200).send(data);
        }
        return res.status(200).json(data);
      }
    } catch (error) {
      error.traceId = req.traceId;
      cacheLogger.error(error, `Get '${key}' from redis cache`);
    }
    // Override res.send to set cache before send
    const originalSend = res.send;
    res.send = async function newSend (data) {
      if (res.statusCode === 200) {
        try {
          if (ex) {
            await redis.set(key, data, 'EX', ex);
          }
          await redis.set(key, data);
        } catch (error) {
          error.traceId = req.traceId;
          cacheLogger.error(error, `Set '${key}' to redis cache`);
        }
      }
      originalSend.call(this, data);
    };

    next();
  };

  return getFromCache;
};
