'use strict';

const lookup = require('../../application/use_cases/word/lookup');

module.exports = function wordController ({
  dictionaryServiceInterface,
  dictionaryServiceImpl,
  logger
}) {
  const dictionaryService = dictionaryServiceInterface(dictionaryServiceImpl());

  const lookUpWord = async (req, res, next) => {
    const { word } = req.params;
    let data;
    try {
      data = await lookup(word, dictionaryService);
      res.json(data);
    } catch (error) {
      return next(error);
    }
    if (req.setToCache) {
      req.setToCache(data, 24 * 60 * 60);
    }
  };

  return {
    lookUpWord
  };
};
