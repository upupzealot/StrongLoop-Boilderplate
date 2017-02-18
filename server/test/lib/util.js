'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const request = require('supertest');

const app = require('../../server.js');
const db = app.datasources.db;

module.exports = {
  app,
  request,

  *shouldThrow (generatorFunc) {
    let err = null;
    try {
      yield generatorFunc();
    } catch (e) {
      err = e;
    }
    should(err).be.ok();
  },

  *shouldNotThrow (generatorFunc) {
    let err = null;
    try {
      yield generatorFunc();
    } catch (e) {
      err = e;
    }
    should(err).not.be.ok();
  },

  getMixinModel (modelName, mixinOption) {
    const model = db.createModel(modelName,
      {}, {
        mixins: mixinOption,
      });

    app.remotes()._typeRegistry._options.warnWhenOverridingType = false;
    app.model(model, {
      public: true,
      dataSource: db,
    });

    return model;
  },
};
