'use strict';

const _ = require('lodash');
const xss = require('xss');

module.exports = (Model, options) => {
  let opts = options.field;

  const parseField = function (field) {
    if (_.isString(field)) {
      return {
        field,
        required: true,
      };
    } else {
      return _.merge({}, {
        field: 'content',
        required: true,
      }, field);
    }
  };

  if (_.isArray(opts)) {
    opts = opts.map((option) => {
      return parseField(option);
    });
  } else {
    opts = [parseField(opts)];
  }

  opts.map((opt) => {
    Model.defineProperty(opt.field, {
      type: String,
      required: opt.required,
      description: opt.description,
    });

    Model.observe('before save', (ctx, next) => {
      const instance = ctx.instance || ctx.data;
      if (instance[opt.field]) {
        instance[opt.field] = xss(instance[opt.field]);
      }
      next();
    });
  });
};
