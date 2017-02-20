'use strict';

require('co-mocha')(require('mocha'));
const _ = require('lodash');
const should = require('should');
const request = require('supertest');

const app = require('../../server.js');
const db = app.datasources.db;

const remoteFuns = (method) => {
  return function (url, body, code) {
    if (_.isNumber(body)) {
      code = body;
      body = {};
    }
    body = body || {};
    code = code || 200;

    return request(app)[method](url)
        .send(body)
        .then((res) => {
          should(res).have.property('status').which.equal(code);
          return res.body;
        });
  };
};

module.exports = {
  app,
  request,

  remote: {
    delete: remoteFuns('delete'),
    patch: remoteFuns('patch'),
    post: remoteFuns('post'),
  },

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
