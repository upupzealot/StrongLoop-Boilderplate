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

  const bruce = yield User.create({
    username: 'bruce',
    email: 'bruce@mit.edu',
    password: 'bebannerdontbehulk',
  });
  bruce.accessToken = (yield bruce.createAccessToken()).id;

  const natasha = yield User.create({
    username: 'natasha',
    email: 'natasharomanova@shield.org',
    password: 'blackwidowonmyown',
  });
  natasha.accessToken = (yield natasha.createAccessToken()).id;

  this.tony = tony;
  this.steve = steve;
  this.bruce = bruce;
  this.natasha = natasha;
};

module.exports.unregister = function*() {
  yield User.deleteAll();
};
