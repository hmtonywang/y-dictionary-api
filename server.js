'use strict';

const http = require('http');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createTerminus } = require('@godaddy/terminus');
const { proxyNumber, port } = require('./config');
const logger = require('./libs/logger');
const routes = require('./routes');

const app = express();
const appLogger = logger('app');
const reqLogger = logger('req');
const resLogger = logger('res');

if (proxyNumber && proxyNumber > 0) {
  app.set('trust proxy', proxyNumber);
} else {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Accept');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
  });
}

app.use((req, res, next) => {
  const startTime = new Date();
  const traceId = uuidv4();
  req.traceId = traceId;
  res.traceId = traceId;
  // Log requests
  reqLogger.info({ req });

  // Override res.send to set res.body before send
  const originalSend = res.send;
  res.send = function newSend(body) {
    res.body = body;
    originalSend.call(this, body);
  };
  res.on('finish', () => {
    const endTime = new Date();
    // Log responses
    resLogger.child({ duration: endTime - startTime }).info({ res });
  })
  next();
});

routes.setup(app);

const beforeShutdown = () => {
  appLogger.info('Application server received signal and going to shut down.');
};
const onSignal = () => {
  appLogger.info('Application server is starting cleanup');
};
const onShutdown = () => {
  appLogger.info('Cleanup finished, application server is shutting down.');
};
const terminusOptions = {
  timeout: 30000, // 30 seconds
  signals: ['SIGINT', 'SIGTERM'],
  beforeShutdown,
  onSignal,
  onShutdown,
};

const server = http.createServer(app);
createTerminus(server, terminusOptions);
server.listen(port, () => {
  appLogger.info(`Application server is listening on port ${port}`);
});
process.on("uncaughtException", (error) => {
  appLogger.error('uncaughtException', error);
});