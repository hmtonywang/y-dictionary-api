'use strict';

module.exports = function hmacSignatureService (service) {
  if (typeof service.sign !== 'function') throw new TypeError('Input service must implement the "sign" function');
  const sign = (str, secret, algorithm) => {
    return service.sign(str, secret, algorithm);
  };
  return {
    sign
  };
};
