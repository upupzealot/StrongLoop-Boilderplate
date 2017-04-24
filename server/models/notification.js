'use strict';

const _ = require('lodash');

module.exports = (Notification) => {
  Notification.beforeRemote('find', (ctx, instance, next) => {
    ctx.args.filter = ctx.args.filter || {};
    ctx.args.filter.where = _.merge(ctx.args.filter.where || {}, {
      to_id: ctx.args.options.accessToken.userId,
      is_read: false,
    });
    next();
  });

  Notification.beforeRemote('count', (ctx, instance, next) => {
    ctx.args.where = _.merge(ctx.args.where || {}, {
      to_id: ctx.args.options.accessToken.userId,
      is_read: false,
    });
    next();
  });
};
