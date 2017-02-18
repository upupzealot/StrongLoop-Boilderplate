'use strict';

const _ = require('lodash');
const co = require('co');

module.exports = (Model, options) => {
  const opt = _.merge({}, {
    // createdAt: 'created_at',
    // createdBy: 'created_by',
    // createdIp: 'created_ip',
    // updatedAt: 'updated_at',
    // updatedBy: 'updated_by',
    // updatedIp: 'updated_ip',
    // deletedAt: 'deleted_at',
    // deletedBy: 'deleted_by',
    // deletedIp: 'deleted_ip',
    // isDeleted: 'is_deleted',
  }, options);

  // create
  if (opt.createdAt) {
    Model.defineProperty(opt.createdAt, {
      type: Date,
      required: true,
    });
  }
  if (opt.createdBy) {
    Model.defineProperty(opt.createdBy, {
      type: Number,
    });
  }
  if (opt.createdIp) {
    Model.defineProperty(opt.createdIp, {
      type: String,
    });
  }

  // update
  if (opt.updatedAt) {
    Model.defineProperty(opt.updatedAt, {
      type: Date,
      required: true,
    });
  }
  if (opt.updatedBy) {
    Model.defineProperty(opt.updatedBy, {
      type: Number,
    });
  }
  if (opt.updatedIp) {
    Model.defineProperty(opt.updatedIp, {
      type: String,
    });
  }

  // delete
  if (opt.isDeleted || opt.deletedAt || opt.deletedBy || opt.deletedIp) {
    opt.isDeleted = opt.isDeleted || 'is_deleted';
    Model.defineProperty(opt.isDeleted, {
      type: Boolean,
      required: true,
      default: false,
    });
  }
  if (opt.deletedAt) {
    Model.defineProperty(opt.deletedAt, {
      type: Date,
    });
  }
  if (opt.deletedBy) {
    Model.defineProperty(opt.deletedBy, {
      type: Number,
    });
  }
  if (opt.deletedIp) {
    Model.defineProperty(opt.deletedIp, {
      type: String,
    });
  }

  // timestamp
  Model.observe('before save', (ctx, next) => {
    if (opt.createdAt || opt.updatedAt) {
      const now = new Date();
      if (ctx.instance && opt.createdAt) {
        ctx.instance[opt.createdAt] = now;
        if (opt.updatedAt) {
          ctx.instance[opt.updatedAt] = now;
        }
      }
      if (ctx.data && opt.updatedAt) {
        ctx.data[opt.updatedAt] = now;
      }
    }
    next();
  });

  // operator
  Model.observe('before save', (ctx, next) => {
    if (ctx.options && ctx.options.accessToken) {
      if (ctx.instance && opt.createdBy) {
        ctx.instance[opt.createdBy] = ctx.options.accessToken.userId;
        if (opt.updatedBy) {
          ctx.instance[opt.updatedBy] = ctx.options.accessToken.userId;
        }
      }
      if (ctx.data && opt.updatedBy) {
        ctx.data[opt.updatedBy] = ctx.options.accessToken.userId;
      }
    }
    next();
  });

  // ip
  Model.observe('before save', (ctx, next) => {
    if (ctx.options && ctx.options.ip) {
      if (ctx.instance && opt.createdIp) {
        ctx.instance[opt.createdIp] = ctx.options.ip;
        if (opt.updatedIp) {
          ctx.instance[opt.updatedIp] = ctx.options.ip;
        }
      }
      if (ctx.data && opt.updatedIp) {
        ctx.data[opt.updatedIp] = ctx.options.ip;
      }
    }
    next();
  });

  // soft delete
  Model.observe('before delete', (ctx, next) => {
    if (opt.isDeleted) {
      co(function*() {
        const now = new Date();
        const updateObj = {};
        updateObj[opt.deletedAt] = now;
        updateObj[opt.isDeleted] = true;

        yield Model.updateAll(ctx.where, updateObj);
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
        ctx.query.where = recursiveAndOr({});
      }
    }
    next();
  });

  Model.createOptionsFromRemotingContext = (ctx) => {
    const match = ctx.req.ip.match(/\d+\.\d+\.\d+\.\d+/);
    const ip = match && match.length ? match[0] : null;
    return {
      accessToken: ctx.req.accessToken,
      ip: ip,
    };
  };
};
