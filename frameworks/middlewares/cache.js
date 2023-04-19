'use strict';

module.exports = ({ cacheImpl, logger }) => {
  const cacheLogger = logger('cache middleware');

  const getFromCache = async (req, res, next) => {
    const { method, originalUrl } = req;
    const key = `${method}_${originalUrl}`;
    try {
      const data = await cacheImpl.get(key);
      if (data) {
        if (typeof data === 'string') {
          return res.send(data);
        }
        return res.json(data);
      }
    } catch (error) {
      error.traceId = req.traceId;
      cacheLogger.error(error, `Get '${key}' from cache`);
    }
    // Override res.send to set cache before send
    const originalSend = res.send;
    res.send = async function newSend (data) {
      if (res.statusCode === 200) {
        try {
          await cacheImpl.set(key, data);
        } catch (error) {
          error.traceId = req.traceId;
          cacheLogger.error(error, `Set '${key}' to cache`);
        }
      }
      originalSend.call(this, data);
    };

    next();
  };

  return getFromCache;
};
