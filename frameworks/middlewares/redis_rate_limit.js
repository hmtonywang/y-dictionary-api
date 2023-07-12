'use strict';

const defaultGlobalOptions = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Enable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.tooManyRequests();
  }
};

const tokenBucket = async ({ redis, options }) => {
  const defaultOptions = {
    refillMs: 5000,
    capacity: 1
  };
  const opts = Object.assign(defaultOptions, options);
  const {
    key,
    refillMs,
    capacity
  } = opts;
  const currentTimestamp = Date.now();

  const tokensKey = `${key}:tokens`;

  const lastTokenTimestamp = await redis.get(key);
  let insertTokensCount = 0;
  if (!lastTokenTimestamp) {
    insertTokensCount = capacity;
  } else {
    const count = Math.floor((currentTimestamp - lastTokenTimestamp) / refillMs);
    insertTokensCount = Math.min(count, capacity);
  }
  if (insertTokensCount > 0) {
    const args = [tokensKey];
    Array(insertTokensCount).fill(true).forEach(() => {
      args.push(1);
    });
    await redis.lpush.apply(redis, args);
    await redis.ltrim(tokensKey, 0, capacity - 1);
    await redis.set(key, currentTimestamp);
  }

  const token = await redis.rpop(tokensKey);

  return !!token;
};

module.exports = ({ redis, logger }) => {
  if (!redis) {
    throw new TypeError('\'redis\' requires an available Redis instance');
  }
  const rateLimitLogger = logger('redis rate limit middleware');
  const createRateLimit = (options = {}) => {
    const opts = Object.assign(defaultGlobalOptions, options);
    const { handler } = opts;
    return async (req, res, next) => {
      const { method, ip } = req;
      if (method === 'OPTIONS') {
        return next();
      }
      try {
        const key = `rate_limit:token_bucket:${ip}`;
        opts.key = key;
        const pass = await tokenBucket({ redis, options: opts });
        if (!pass) {
          return handler(req, res);
        }
      } catch (error) {
        error.traceId = req.traceId;
        rateLimitLogger.error(error);
        res.internalServerError();
        return;
      }
      next();
    };
  };
  return {
    createRateLimit
  };
};
