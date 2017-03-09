'use strict';

const _ = require('lodash');
const HtmlField = require('./html-field.js');

module.exports = (Model, options) => {
  const opt = _.merge({}, {
    field: 'title',
    required: true,
  }, options);

  HtmlField(Model, opt);
};
