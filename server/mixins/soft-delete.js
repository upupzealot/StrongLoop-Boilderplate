'use strict';

const _ = require('lodash');
const co = require('co');

const config = require('../config/index.js');

module.exports = function (Model) {
  Model.defineProperty(config.marksMixin.isDeleted, {
    type: Boolean,
    required: true,
    default: false,
  });

  Model.observe('before delete', (ctx, next) => {
    co(function*() {
      const updateObj = {};
      updateObj[config.marksMixin.isDeleted] = true;
      if (Model.onDeleteFuncs) {
        Model.onDeleteFuncs.map((func) => {
          func(updateObj, ctx);
        });
      }
      const topics = yield Model.find(ctx.where);
      yield topics.map(function*(topic) {
        yield topic.updateAttributes(updateObj);
      });

      ctx.where = {id: NaN};
      next(null);
    }).catch(next);
  });

  const recursiveAndOr = (condition) => {
    if (condition[config.marksMixin.isDeleted] === undefined) {
      condition[config.marksMixin.isDeleted] = false;
    }
    ['and', 'or'].forEach(operator => {
      let op = condition[operator];
      if (op) {
        op = op.map(condition => {
          return recursiveAndOr(condition);
        });
      }
    });
    return condition;
  };
  Model.observe('access', (ctx, next) => {
    if (config.marksMixin.isDeleted) {
      if (ctx.query.where) {
        recursiveAndOr(ctx.query.where);
      } else {
        ctx.query.where = _.omit(ctx.query, ['fields', 'include', 'order', 'limit', 'skip', 'offset']);
        if (ctx.query.where[config.marksMixin.isDeleted] === undefined) {
          ctx.query.where[config.marksMixin.isDeleted] = false;
        }
      }
    }
    next();
  });
};
