'use strict';

const crypto = require('crypto');

module.exports = function hmacSignatureService () {
  const sign = (str, secret, algorithm = 'sha512') => {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(str);
    return hmac.digest('hex');
  };
  return {
    sign
  };
};
