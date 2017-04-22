'use strict';

const _ = require('lodash');
const co = require('co');
const loopback = require('loopback');

const config = require('../config/index.js');

module.exports = (Model, options) => {
  const opt = _.merge({}, {
    create: true,
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
      if (opt.create && ctx.hookState.isNew) {
        const instance = ctx.instance;
        yield subsOnCreate(instance);
      }
      next();
    }).catch(next);
  });

  function* subsOnCreate (instance) {
    const Subscription = loopback.getModel('Subscription');

    const subscription = {
      user_id: instance[config.marksMixin.createdBy],
      action: Model.modelName === 'Comment' ? 'reply' : 'comment',
      target_type: Model.modelName,
      target_id: instance.id,
    };
    yield Subscription.create(subscription);
  }
};
