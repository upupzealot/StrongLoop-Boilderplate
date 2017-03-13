'use strict';

const co = require('co');
const fs = require('fs');
const path = require('path');
const loopback = require('loopback');
const cookieSignature = require('cookie-signature');

module.exports = (User) => {
  User.afterRemote('create', (ctx, instance, next) => {
    co(function*() {
      const token = yield instance.createAccessToken();
      const signature = `s:${cookieSignature.sign(token.id, '***')}`;
      ctx.res.cookie('authorization', signature);
      next();
    }).catch(next);
  });

  User.beforeRemote('login', (ctx, instance, next) => {
    co(function*() {
      const User = loopback.getModel('user');
      const user = yield User.findOne({
        where: {
          username: ctx.args.credentials.email,
        },
      });
      if (user) {
        ctx.args.credentials.email = user.email;
      }
      next();
    }).catch(next);
  });

  User.afterRemote('login', (ctx, instance, next) => {
    co(function*() {
      const signature = `s:${cookieSignature.sign(instance.id, '***')}`;
      ctx.res.cookie('authorization', signature);
      next();
    }).catch(next);
  });

  if (process.env.NODE_ENV !== 'test') {
    const userJs = path.resolve(__dirname, '../../biz/models/user.js');
    if (fs.existsSync(userJs)) {
      require(userJs)(User);
    }
  }
};
