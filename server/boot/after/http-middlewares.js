'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const loopback = require('loopback');
const AccessToken = loopback.getModel('AccessToken');

module.exports = (server) => {
  server.use(bodyParser.urlencoded({extended: true}));

  server.use(cookieParser('***'));
  server.use(loopback.token({
    model: AccessToken,
  }));
};
