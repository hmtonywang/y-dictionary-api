'use strict';

const http = require('http');
const express = require('express');
const config = require('./config');
const logger = require('./libs/logger');
const server = require('./frameworks/server');

const uncaughtExceptionLogger = logger('uncaughtException');
const app = express();
const httpServer = http.createServer(app);

server({
  app,
  server: httpServer,
  config,
  logger
}).launch();

process.on('uncaughtException', (err) => {
  uncaughtExceptionLogger.error(err);
});

module.exports = app;
