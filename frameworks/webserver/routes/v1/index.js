'use strict';

const word = require('./word');

module.exports = ({ express, redisClient, config, logger }) => {
  const router = express.Router();

  router.use('/words', word({ express, redisClient, config, logger }));

  return router;
};
