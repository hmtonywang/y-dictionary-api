'use strict';

const api = require('./api');

module.exports = {
  setup: (app) => {    
    api.setup(app);
    app.use('*', (req, res) => {
      res.status(404).send('Not Found');
    });
  },
};