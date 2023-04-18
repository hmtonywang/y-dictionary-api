'use strict';

const ydCrawler = require('../../libs/yahoo_dictionary_crawler');

module.exports = ({ logger }) => {
  const controllerLogger = logger('word controller');

  const getMeaning = async (req, res, next) => {
    const { word } = req.params;
    try {
      const crawler = await ydCrawler(word);
      const data = crawler.getData();
      res.respond(data);
    } catch (error) {
      error.traceId = req.traceId;
      controllerLogger.error(error);
      res.failServerError();
    }
  };

  return {
    getMeaning,
  };
};