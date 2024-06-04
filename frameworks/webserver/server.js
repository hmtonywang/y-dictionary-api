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
  const launch = () => {
    server.listen(config.port, () => {
      logger.info(`Server is listening on port ${config.port}`);
    });
  };

  const beforeShutdown = () => {
    logger.info('Server received signal and going to shut down.');
  };

  const onSignal = async () => {
    logger.info('Server is starting cleanup.');
    if (redisClient) {
      await redisClient.disconnect();
    }
  };

  const onShutdown = () => {
    logger.info('Cleanup finished, server is shutting down.');
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
