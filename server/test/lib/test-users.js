'use strict';

const loopback = require('loopback');
const User = loopback.getModel('user');

module.exports.register = function*() {
  const tony = yield User.create({
    username: 'tony',
    email: 'tony@stark-industry.com',
    password: 'tonystark0529',
  });
  tony.accessToken = (yield tony.createAccessToken()).id;

  const steve = yield User.create({
    username: 'steve',
    email: 'steve@us-army.us.gov',
    password: 'steverogers0704',
  });
  steve.accessToken = (yield steve.createAccessToken()).id;

  this.tony = tony;
  this.steve = steve;
}

module.exports.unregister = function*() {
  yield User.deleteAll();
}
