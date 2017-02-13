'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const loopback = require('loopback');

const app = loopback();
const db = loopback.createDataSource('db', {adapter: 'memory'});

module.exports = {
  shouldThrow: function*(generatorFunc) {
    let err = null;
    try {
      yield generatorFunc();
    } catch(e) {
      err = e;
    }
    should(err).be.ok();
  },

  shouldNotThrow: function*(generatorFunc) {
    let err = null;
    try {
      yield generatorFunc();
    } catch(e) {
      err = e;
    }
    should(err).not.be.ok();
  },

  getMixinModel: function(modelName, mixinOption) {
    return db.createModel(modelName, 
      {}, {
        dataSource: db,
        mixins: mixinOption,
      });
  },
}
