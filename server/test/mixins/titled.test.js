'use strict';

require('co-mocha')(require('mocha'));

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const getModel = util.getMixinModel;

describe('Mixin: Titled', function () {
  it('"title" field requirement', function*() {
    const Topic = getModel('Topic', {
      Titled: {},
    });

    yield shouldThrow(function*() {
      yield Topic.create({});
    });

    yield shouldNotThrow(function*() {
      yield Topic.create({title: '标题'});
    });
  });

  describe('options', function () {
    it('field', function*() {
      const Topic = getModel('Topic', {
        Titled: {
          field: 'topic_title',
        },
      });

      yield shouldNotThrow(function*() {
        yield Topic.create({topic_title: '标题'});
      });
    });

    it('required', function*() {
      const Topic = getModel('Topic', {
        Titled: {
          required: false,
        },
      });

      shouldNotThrow(function*() {
        yield Topic.create({});
      });
    });
  });
});
