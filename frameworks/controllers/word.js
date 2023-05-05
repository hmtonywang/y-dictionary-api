'use strict';

const crawler = require('dictionary-crawler');

module.exports = ({ logger }) => {
  const controllerLogger = logger('word controller');

  const getMeaning = async (req, res, next) => {
    const { word } = req.params;
    try {
      const data = await crawler.yahoo.crawl(word);
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
