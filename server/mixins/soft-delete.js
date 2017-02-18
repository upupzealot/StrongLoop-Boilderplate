'use strict';

const _ = require('lodash');
const co = require('co');

module.exports = function (Model, options) {
  const opt = _.merge({}, {
    // deletedAt: 'deleted_at',
    // deletedBy: 'deleted_by',
    // deletedIp: 'deleted_ip',
    // isDeleted: 'is_deleted',
  }, options);

  // delete
  if (opt.isDeleted || opt.deletedAt || opt.deletedBy || opt.deletedIp) {
    opt.isDeleted = opt.isDeleted || 'is_deleted';
    Model.defineProperty(opt.isDeleted, {
      type: Boolean,
      required: true,
      default: false,
    });
  }

  // delete
  Model.observe('before delete', (ctx, next) => {
    if (opt.isDeleted) {
      co(function*() {
        const updateObj = {};
        updateObj[opt.isDeleted] = true;
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
    if (condition[opt.isDeleted] === undefined) {
      condition[opt.isDeleted] = false;
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
    if (opt.isDeleted) {
      if (ctx.query.where) {
        recursiveAndOr(ctx.query.where);
      } else {
        ctx.query.where = _.omit(ctx.query, ['fields', 'include', 'order', 'limit', 'skip', 'offset']);
        if (ctx.query.where[opt.isDeleted] === undefined) {
          ctx.query.where[opt.isDeleted] = false;
        }
      }
    }
    next();
  });
};
