'use strict';

const helmet = require('helmet');
const compression = require('compression');
const Redis = require('ioredis');
const { createTerminus } = require('@godaddy/terminus');
const httpLoggerMiddleware = require('./middlewares/http_logger');
const responseMiddleware = require('./middlewares/response');
const authMiddleware = require('./middlewares/auth');
const redisRateLimitMiddleware = require('./middlewares/redis_rate_limit');
const rateLimitMiddleware = require('./middlewares/rate_limit');
const errorHandlerMiddleware = require('./middlewares/error_handler');
const routes = require('./routes');

module.exports = ({ app, server, config, logger }) => {
  const appLogger = logger({ name: 'app', src: false });
  let redis;
  if (config.redis) {
    redis = new Redis(config.redis);
  }

  if (config.env === 'production' && config.proxyNumber) {
    app.set('trust proxy', config.proxyNumber);
  }
  app.use(helmet());
  app.use(compression());
  app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Accept,X-API-KEY,X-SIGNATURE,X-TIMESTAMP');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    next();
  });
  app.use(httpLoggerMiddleware(logger));
  app.use(responseMiddleware);
  app.use(authMiddleware({ config }));
  if (config.rateLimit) {
    if (redis) {
      app.use(redisRateLimitMiddleware({ redis, logger }).createRateLimit());
    } else {
      app.use(rateLimitMiddleware().createRateLimit());
    }
  }
  app.use(routes({ config, logger, redis }));
  app.use(errorHandlerMiddleware({ logger }));

  const launch = () => {
    server.listen(config.port, () => {
      appLogger.info(`Server is listening on port ${config.port}`);
    });
  };

  const beforeShutdown = () => {
    appLogger.info('Server received signal and going to shut down.');
  };

  const onSignal = async () => {
    appLogger.info('Server is starting cleanup.');
    if (redis) {
      redis.disconnect();
      appLogger.info('Redis is disconnected.');
    }
  };

  const onShutdown = () => {
    appLogger.info('Cleanup finished, server is shutting down.');
  };

  const healthCheck = ({ state }) => {
    if (state.isShuttingDown) {
      return Promise.reject(new Error('Server is shutting down.'));
    }
    return Promise.resolve();
  };

  createTerminus(server, {
    healthChecks: {
      '/healthcheck': healthCheck
    },
    signals: ['SIGINT', 'SIGTERM'],
    sendFailuresDuringShutdown: true,
    beforeShutdown,
    onSignal,
    onShutdown
  });

  return {
    launch
  };
};
