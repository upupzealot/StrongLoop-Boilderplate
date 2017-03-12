'use strict';

const _ = require('lodash');
const moment = require('moment');
const config = global.config;

const co = require('co');
const loopback = require('loopback');
const User = loopback.getModel('user');

module.exports = (server) => {
  server.use((req, res, next) => {
    co(function*() {
      res.locals._ = _;
      res.locals.config = config;
      res.locals.moment = moment;
      if (req.accessToken) {
        res.locals.user = yield User.findById(req.accessToken.userId);
      }
      next();
    }).catch(next);
  });
};
