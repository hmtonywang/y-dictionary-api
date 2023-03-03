'use strict';

const express = require('express');
const { query, validationResult } = require('express-validator');
const logger = require('../../libs/logger')('routes/api/lookup');
const ydCrawler = require('../../libs/yahoo_dictionary_crawler');
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
    try {
      const crawler = await ydCrawler(w);
      const data = crawler.getData();
      res.status(200).json({ data });
    } catch (error) {
      if (error.message === 'Not Found') {
        return res.status(200).json({ data: error.message });
      }
      logger.error(error);
      res.status(500).json({ error: 'Something wrong' });
    }
  }
);

module.exports = router;