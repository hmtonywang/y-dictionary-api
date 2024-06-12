'use strict';

module.exports.windowMs = 5000; // 5 seconds
module.exports.max = 1; // Limit each IP to 100 requests per `window`
module.exports.standardHeaders = true; // Return rate limit info in the `RateLimit-*` headers
module.exports.legacyHeaders = false; // Disable the `X-RateLimit-*` headers
