'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const loopback = require('loopback');

const shouldThrow = function*(generatorFunc) {
  let err = null;
  try {
    yield generatorFunc();
  } catch(e) {
    err = e;
  }
  should(err).be.ok();
}

const shouldNotThrow = function*(generatorFunc) {
  let err = null;
  try {
    yield generatorFunc();
  } catch(e) {
    err = e;
  }
  should(err).not.be.ok();
}

describe('Mixin: Titled', function() {
  const ctx = {};

  before(function() {
    const app = loopback();

    const db = loopback.createDataSource('db', {adapter: 'memory'});
    ctx.db = db;

    const Topic = loopback.createModel('Topic', 
      {}, {});
    ctx.Topic = Topic;
  });

  it('"title" is required', function*() {
    loopback.configureModel(ctx.Topic, {
      dataSource: ctx.db,
      mixins: {
        Titled: {},
      },
    });

    shouldThrow(function*() {
      yield ctx.Topic.create({});
    });

    shouldNotThrow(function*() {
      yield ctx.Topic.create({title: '标题'});
    });
  });

  describe('Mixin Options', function() {
    it('field', function*() {
      loopback.configureModel(ctx.Topic, {
        dataSource: ctx.db,
        mixins: {
          Titled: {
            field: 'topic_title',
          },
        },
      });

      shouldNotThrow(function*() {
        yield ctx.Topic.create({topic_title: '标题'});
      });
    });

    it('required', function*() {
      loopback.configureModel(ctx.Topic, {
        dataSource: ctx.db,
        mixins: {
          Titled: {
            required: false,
          },
        },
      });

      shouldNotThrow(function*() {
        yield ctx.Topic.create({});
      });
    });
  });
});
