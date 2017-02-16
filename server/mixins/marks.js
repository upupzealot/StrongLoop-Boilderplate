'use strict';

const _ = require('lodash');

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

  Model.observe('before save', (ctx, next) => {
    ctx.now = ctx.now || new Date();
    if (opt.createdAt && ctx.isNewInstance) {
      ctx.instance[opt.createdAt] = ctx.now;
    }
    next();
  });

  Model.observe('before save', (ctx, next) => {
    if ( opt.createdBy
      && ctx.isNewInstance
      && ctx.options
      && ctx.options.accessToken) {
      ctx.instance[opt.createdBy] = ctx.options.accessToken.userId;
    }
    next();
  });

  Model.observe('before save', (ctx, next) => {
    if ( opt.createdIp
      && ctx.isNewInstance
      && ctx.options
      && ctx.options.ip) {
      ctx.instance[opt.createdIp] = ctx.options.ip;
    }
    next();
  });

  Model.createOptionsFromRemotingContext = (ctx) => {
    const match = ctx.req.ip.match(/\d+\.\d+\.\d+\.\d+/)
    const ip = match && match.length ? match[0] : null;
    return {
      accessToken: ctx.req.accessToken,
      ip: ip,
    };
  };
};
