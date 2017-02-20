'use strict';

const app = require('../../server.js');
const db = app.datasources.db;

const getMixinModel = function (modelName, mixinOption) {
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
};

module.exports = function (mixinName, opts) {
  return function () {
    const opt = {};
    opt[mixinName] = opts[this.currentTest.title] || {};
    this.Topic = getMixinModel('Topic', opt);
  };
};
