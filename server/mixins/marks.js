'use strict';

const _ = require('lodash');

const config = require('../config/index.js');
const SoftDeleteMixin = require('./soft-delete.js');

module.exports = (Model, options) => {
  const opt = _.merge({}, options);

  // create
  if (opt.createdAt) {
    Model.defineProperty(config.marksMixin.createdAt, {
      type: Date,
      required: true,
    });
  }
  if (opt.createdBy) {
    Model.defineProperty(config.marksMixin.createdBy, {
      type: Number,
    });
  }
  if (opt.createdIp) {
    Model.defineProperty(config.marksMixin.createdIp, {
      type: String,
    });
  }

  // update
  if (opt.updatedAt) {
    Model.defineProperty(config.marksMixin.updatedAt, {
      type: Date,
      required: true,
    });
  }
  if (opt.updatedBy) {
    Model.defineProperty(config.marksMixin.updatedBy, {
      type: Number,
    });
  }
  if (opt.updatedIp) {
    Model.defineProperty(config.marksMixin.updatedIp, {
      type: String,
    });
  }

  // delete
  if (opt.isDeleted || opt.deletedAt || opt.deletedBy || opt.deletedIp) {
    const softDeleteopt = _.pick(opt, ['isDeleted', 'deletedAt', 'deletedBy', 'deletedIp']);
    Model.onDeleteFuncs = Model.onDeleteFuncs || [];
    Model.onDeleteFuncs.push((updateObj, ctx) => {
      if (opt.deletedAt) {
        const now = new Date();
        updateObj[config.marksMixin.deletedAt] = now;
      }
      if (opt.deletedBy && ctx.options.accessToken) {
        updateObj[config.marksMixin.deletedBy] = ctx.options.accessToken.userId;
      }
      if (opt.deletedIp && ctx.options.ip) {
        updateObj[config.marksMixin.deletedIp] = ctx.options.ip;
      }
    });
    SoftDeleteMixin(Model, softDeleteopt);
  }
  if (opt.deletedAt) {
    Model.defineProperty(config.marksMixin.deletedAt, {
      type: Date,
    });
  }
  if (opt.deletedBy) {
    Model.defineProperty(config.marksMixin.deletedBy, {
      type: Number,
    });
  }
  if (opt.deletedIp) {
    Model.defineProperty(config.marksMixin.deletedIp, {
      type: String,
    });
  }

  // timestamp
  Model.observe('before save', (ctx, next) => {
    if (opt.createdAt || opt.updatedAt) {
      const now = new Date();
      if (ctx.instance && opt.createdAt) {
        ctx.instance[config.marksMixin.createdAt] = now;
        if (opt.updatedAt) {
          ctx.instance[config.marksMixin.updatedAt] = now;
        }
      }
      if (ctx.data && opt.updatedAt) {
        ctx.data[config.marksMixin.updatedAt] = now;
      }
    }
    next();
  });

  // operator
  Model.observe('before save', (ctx, next) => {
    if (ctx.options && ctx.options.accessToken) {
      if (ctx.instance && opt.createdBy) {
        ctx.instance[config.marksMixin.createdBy] = ctx.options.accessToken.userId;
        if (opt.updatedBy) {
          ctx.instance[config.marksMixin.updatedBy] = ctx.options.accessToken.userId;
        }
      }
      if (ctx.data && opt.updatedBy) {
        ctx.data[config.marksMixin.updatedBy] = ctx.options.accessToken.userId;
      }
    }
    next();
  });

  // ip
  Model.observe('before save', (ctx, next) => {
    if (ctx.options && ctx.options.ip) {
      if (ctx.instance && opt.createdIp) {
        ctx.instance[config.marksMixin.createdIp] = ctx.options.ip;
        if (opt.updatedIp) {
          ctx.instance[config.marksMixin.updatedIp] = ctx.options.ip;
        }
      }
      if (ctx.data && opt.updatedIp) {
        ctx.data[config.marksMixin.updatedIp] = ctx.options.ip;
      }
    }
    next();
  });

  Model.createOptionsFromRemotingContext = (ctx) => {
    const match = ctx.req.ip.match(/\d+\.\d+\.\d+\.\d+/);
    const ip = match && match.length ? match[0] : null;
    return {
      accessToken: ctx.req.accessToken,
      ip,
    };
  };
};
