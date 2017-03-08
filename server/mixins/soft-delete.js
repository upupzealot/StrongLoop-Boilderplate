'use strict';

const _ = require('lodash');
const co = require('co');

module.exports = function (Model, options) {
  const opt = _.merge({}, {
    field: 'is_deleted',
  }, options);

  // delete
  if (opt.field) {
    opt.field = opt.field || 'is_deleted';
    Model.defineProperty(opt.field, {
      type: Boolean,
      required: true,
      default: false,
    });
  }

  // delete
  Model.observe('before delete', (ctx, next) => {
    if (opt.field) {
      co(function*() {
        const updateObj = {};
        updateObj[opt.field] = true;
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
    }
  });

  const recursiveAndOr = (condition) => {
    if (condition[opt.field] === undefined) {
      condition[opt.field] = false;
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
    if (opt.field) {
      if (ctx.query.where) {
        recursiveAndOr(ctx.query.where);
      } else {
        ctx.query.where = _.omit(ctx.query, ['fields', 'include', 'order', 'limit', 'skip', 'offset']);
        if (ctx.query.where[opt.field] === undefined) {
          ctx.query.where[opt.field] = false;
        }
      }
    }
    next();
  });
};
