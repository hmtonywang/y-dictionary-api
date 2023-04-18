'use strict';

const helmet = require('helmet');
const compression = require('compression');
const { createTerminus } = require('@godaddy/terminus');
const httpLoggerMiddleware = require('./middlewares/http_logger');
const authMiddleware = require('./middlewares/auth');
const responseMiddleware = require('./middlewares/response');
const errorHandlerMiddleware = require('./middlewares/error_handler');;
const routes = require('./routes');

module.exports = ({ app, server, config, logger }) => {
  const appLogger = logger({ name: 'app', src: false });

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
  app.use(routes({ config, logger }));
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
  };

  const onShutdown = () => {
    appLogger.info('Cleanup finished, server is shutting down.');
  };

  createTerminus(server, {
    signals: ['SIGINT', 'SIGTERM'],
    sendFailuresDuringShutdown: true,
    beforeShutdown,
    onSignal,
    onShutdown,
  });

  return {
    launch,
  };
};