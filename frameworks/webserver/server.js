'use strict';

const { createTerminus } = require('@godaddy/terminus');

module.exports = function serverConfig ({
  app,
  server,
  redisClient,
  config,
  logger
}) {
  if (config.proxyNumber) {
    app.set('trust proxy', config.proxyNumber);
  }
  function launch () {
    server.listen(config.port, () => {
      logger.info(`Server is listening on port ${config.port}`);
    });
  };

  function beforeShutdown () {
    logger.info('Server received signal and going to shut down.');
  };

  function onSignal () {
    logger.info('Server is starting cleanup.');
    return Promise.all([
      redisClient.disconnect()
    ]);
  };

  function onShutdown () {
    logger.info('Cleanup finished, server is shutting down.');
  };

  function healthCheck ({ state }) {
    if (state.isShuttingDown) {
      return Promise.reject(new Error('Server is shutting down.'));
    }
    return Promise.resolve();
  };

  function loggerFunc (msg, error) {
    logger.error({ error }, msg);
  };

  createTerminus(server, {
    healthChecks: {
      '/healthcheck': healthCheck
    },
    signals: ['SIGINT', 'SIGTERM'],
    sendFailuresDuringShutdown: true,
    beforeShutdown,
    onSignal,
    onShutdown,
    logger: loggerFunc
  });

  return {
    launch
  };
};
