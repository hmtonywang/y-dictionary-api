'use strict';

const crypto = require('crypto');

module.exports.sign = (str, secret, algorithm = 'sha512') => {
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(str);
  return hmac.digest('hex');
};
