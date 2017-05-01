'use strict';

const _ = require('lodash');
const co = require('co');
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
  };

  Notification.prototype.getHTML = function*() {
    const event = this.toJSON().event;
    const targetModel = loopback.getModel(event.target_type);

    if (event.action === 'comment' || event.action === 'reply') {
      if (event.action === 'comment') {
        this.html =
        `${event.from.username
        } 评论了你的${targetModel.modelName
        } <a href="${event.target.url}">${event.target.title
        }</a> `;
      }

      if (event.action === 'reply') {
        const commentableModel = loopback.getModel(event.target.commentable_type);
        const commentable = yield commentableModel.findById(event.target.commentable_id);

        this.html =
        `${event.from.username
        } 回复了你在 ${commentableModel.modelName
        } <a href="${commentable.url}">${commentable.title
        }</a> 下的评论${targetModel.modelName
        }(${event.target_id})`;
      }
    } else {
      this.html =
        `${event.from.username
        } ${Actions[event.action]
        } ${targetModel.modelName
        }(${event.target_id})`;
    }
  };

  Notification.afterRemote('find', (ctx, instances, next) => {
    co(function*() {
      yield instances.map(function*(instance) {
        yield instance.getHTML();
      });
      next();
    }).catch(next);
  });

  Notification.beforeRemote('count', (ctx, instance, next) => {
    ctx.args.where = _.merge(ctx.args.where || {}, {
      to_id: ctx.args.options.accessToken.userId,
    });
    next();
  });
};
