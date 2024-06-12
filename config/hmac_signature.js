'use strict';

module.exports.apiKey = process.env.HMAC_SIGNATURE_API_KEY || 'api-key';
module.exports.expireTimeSec = process.env.HMAC_SIGNATURE_EXPIRE_TIME_SEC || 5;
module.exports.algorithm = process.env.HMAC_SIGNATURE_ALGORITHM || 'sha512';
