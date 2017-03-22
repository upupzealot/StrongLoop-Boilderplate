'use strict';

const _ = require('lodash');
const co = require('co');
const Promise = require('bluebird');

module.exports = (Model, options) => {
  Model.defineProperty('view_count', {
    type: 'number',
    default: 0,
  });

  Model.viewById = Promise.promisify((id, filter, callback) => {
    if (_.isFunction(filter)) {
      callback = filter;
      filter = null;
    }

    co(function*() {
      const instance = yield Model.findById(id, filter);
      if (instance) {
        yield instance.updateAttribute('view_count', instance.view_count + 1);
      }
      return callback(null, instance);
    }).catch(callback);
  });
};
