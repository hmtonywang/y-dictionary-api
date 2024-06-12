'use strict';

module.exports = function loggerConfig (bunyan, config) {
  const defaultOptions = {
    src: true,
    streams: [
      {
        level: config.level,
        stream: process.stdout
      }
    ],
    serializers: {
      error: (error) => {
        return {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
      }
    }
  };
  return function createLogger (options) {
    const config = typeof options === 'string'
      ? { name: options }
      : options;
    const settings = {
      ...defaultOptions,
      ...config
    };
    return bunyan.createLogger(settings);
  };
};
