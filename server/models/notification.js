'use strict';

const _ = require('lodash');
const loopback = require('loopback');

module.exports = (Notification) => {
  Notification.beforeRemote('find', (ctx, instance, next) => {
    ctx.args.filter = ctx.args.filter || {};
    ctx.args.filter.where = _.merge(ctx.args.filter.where || {}, {
      to_id: ctx.args.options.accessToken.userId,
    });
    ctx.args.filter.include = {
      relation: 'event',
      scope: {
        include: ['from', 'target'],
      },
    };
    next();
  });

  const Actions = {
    create: '创建了',
    comment: '评论了',
    reply: '回复了',
  }

  Notification.prototype.getHTML = function() {
    const event = this.toJSON().event;

    if(event.action === 'comment') {
      this.html =
        event.from.username +
        ' 评论了你的' + loopback.getModel(event.target.commentable_type).modelName +
        '(' + event.target.commentable_id + ')';
    } else if(event.action === 'reply') {
      this.html =
        event.from.username +
        ' 回复了你在 ' + loopback.getModel(event.target.commentable_type).modelName +
        '(' + event.target.commentable_id + ')' +
        ' 下的评论' + 
        loopback.getModel(event.target_type).modelName +
        '(' + event.target_id + ')';
    } else {
      this.html =
        `${event.from.username
        } ${Actions[event.action]
        } ${loopback.getModel(event.target_type).modelName
        }(${event.target_id})`;
    }
  }

  Notification.afterRemote('find', (ctx, instances, next) => {
    instances.forEach((instance) => {
      instance.getHTML();
    });
    next();
  });

  Notification.beforeRemote('count', (ctx, instance, next) => {
    ctx.args.where = _.merge(ctx.args.where || {}, {
      to_id: ctx.args.options.accessToken.userId,
    });
    next();
  });
};
