'use strict';

const ydCrawler = require('../../libs/yahoo_dictionary_crawler');

module.exports = ({ logger }) => {
  const controllerLogger = logger('word controller');

  const getMeaning = async (req, res, next) => {
    const { word } = req.params;
    try {
      const crawler = ydCrawler(word);
      const data = await crawler.getData();
      res.respond(data);
    } catch (error) {
      error.traceId = req.traceId;
      controllerLogger.error(error);
      res.internalServerError();
    }
  };

  return {
    getMeaning
  };
};
