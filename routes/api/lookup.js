'use strict';

const express = require('express');
const { query, validationResult } = require('express-validator');
const logger = require('../../libs/logger')('routes/api/lookup');
const ydCrawler = require('../../libs/yahoo_dictionary_crawler');
const cache = require('../../libs/cache');
const router = express.Router();

router.get(
  '/',
  query('w').escape().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      return res.status(400).json({ error: error.msg });
    }
    const { w } = req.query;
    let data;
    try {
      data = await cache.get(w);
    } catch (error) {
      logger.error(`Get ${w} from cache`, error);
    }
    if (!data) {
      try {
        const crawler = await ydCrawler(w);
        data = crawler.getData();
      } catch (error) {
        if (error.message !== 'Not Found') {
          logger.error(`Look up '${w}'`, error);
          res.status(500).json({ error: 'Something wrong' });
          return;
          
        }
        data = error.message;
      }
      try {
        await cache.set(w, data);
      } catch (error) {
        logger.error(`Set ${w} to cache`, error);
      }
    }
    res.status(200).json({ data });
  }
);

module.exports = router;