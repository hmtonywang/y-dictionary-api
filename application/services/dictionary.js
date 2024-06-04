'use strict';

module.exports = function dictionaryService (service) {
  if (typeof service.lookup !== 'function') throw new TypeError('Input service must implement the "lookup" function');
  const lookup = (word) => {
    return service.lookup(word);
  };
  return {
    lookup
  };
};
