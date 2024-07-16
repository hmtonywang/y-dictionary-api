'use strict';

const { createTerminus } = require('@godaddy/terminus');
const { CronJob } = require('cron');

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

  if (config.keepAliveUrl) {
    function keepAlive () {
      fetch(config.keepAliveUrl)
        .then((res) => {
          if (res.status === 200) {
            logger.info('Server is alive');
          } else {
            logger.warn(`Failed to keep server alive with status code: ${res.status}`);
          }
        })
        .catch((error) => {
          logger.error({ error }, 'Keep server alive error');
        });
    }
    const keepAliveJob = new CronJob('*/14 * * * *', keepAlive);
    logger.info('Keep server alive job started');
    keepAliveJob.start();
  }

  return {
    launch
  };
};
