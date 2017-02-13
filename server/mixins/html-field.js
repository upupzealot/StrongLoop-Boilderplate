'use strict';

const _ = require('lodash');
const xss = require('xss');

module.exports = (Model, options)=> {
  const opt = _.merge({}, {
    field: 'content',
    required: true,
  }, options);

  Model.defineProperty(opt.field, {
    type: String,
    required: opt.required,
  });

  Model.observe('before save', (ctx, next)=>{
    const instance = ctx.instance;
    instance[opt.field] = xss(instance[opt.field]);
    next();
  });
}
