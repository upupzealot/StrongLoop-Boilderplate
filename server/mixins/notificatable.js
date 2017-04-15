'use strict';

const _ = require('lodash');
const co = require('co');
const loopback = require('loopback');

const config = require('../config/index.js');

module.exports = (Model, options) => {
  const opt = _.merge({}, {
    // create: true,
    // update: false,
  }, options);

  Model.observe('before save', (ctx, next) => {
    if (opt.create || opt.update) {
      if (ctx.instance) {
        ctx.hookState.isNew = true;
      }
      if (ctx.data) {
        ctx.hookState.isNew = false;
      }
    }
    next();
  });

  Model.observe('after save', (ctx, next) => {
    co(function*() {
      if (opt.create || opt.update) {
        const instance = ctx.instance;
        if (ctx.hookState.isNew === true && opt.create) {
          yield notiOnCreate(instance);
        }
        if (ctx.hookState.isNew === false && opt.update) {
          yield notiOnUpdate(instance);
        }
      }
      next();
    }).catch(next);
  });

  function* notiOnCreate (instance) {
    const NotificationEvent = loopback.getModel('NotificationEvent');

    if (Model.modelName === 'Comment') {
      return yield notiOnComment(instance);
    }

    yield NotificationEvent.emitNoti({
      from: instance[config.marksMixin.createdBy],
      action: 'create',
      target_type: Model.modelName,
      target_id: instance.id,
    });
  }

  function* notiOnUpdate (instance) {
    const NotificationEvent = loopback.getModel('NotificationEvent');

    yield NotificationEvent.emitNoti({
      from: instance[config.marksMixin.updatedBy],
      action: 'update',
      target_type: Model.modelName,
      target_id: instance.id,
    });
  }

  function* notiOnComment (comment) {
    const NotificationEvent = loopback.getModel('NotificationEvent');
    const commenterId = comment[config.marksMixin.createdBy];

    yield NotificationEvent.emitNoti({
      from: commenterId,
      action: 'comment',
      target_type: Model.modelName,
      target_id: comment.id,
    });

    const parent = yield comment.parent.getAsync();
    if (parent) {
      yield NotificationEvent.emitNoti({
        from: commenterId,
        action: 'reply',
        target_type: 'Comment',
        target_id: parent.id,
      });
    }

    const replied = yield comment.replied.getAsync();
    if (replied) {
      yield NotificationEvent.emitNoti({
        from: commenterId,
        action: 'reply',
        target_type: 'Comment',
        target_id: replied.id,
      });
    }
  }
};
