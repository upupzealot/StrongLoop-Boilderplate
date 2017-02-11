'use strict';

const _ = require('lodash');

module.exports = (Model, options)=> {
  const opt = _.merge({}, {
    field: 'title',
    required: true,
  }, options);

  Model.defineProperty(opt.field, {
    type: String,
    description: Model.name + ' 标题',
    required: opt.required,
  });
}
