'use strict';

const crawler = require('dictionary-crawler');

module.exports = function dictionaryService () {
  const lookup = (word) => {
    return crawler.yahoo.crawl(word);
  };
  return {
    lookup
  };
};
