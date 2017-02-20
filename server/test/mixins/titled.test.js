'use strict';

require('co-mocha')(require('mocha'));

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const mixinModel = require('../lib/mixin-model');

describe('Mixin: Titled', function () {
  const opts = {};
  beforeEach(mixinModel('Titled', opts));

  it('"title" field requirement', function*() {
    const self = this;

    yield shouldThrow(function*() {
      yield self.Topic.create({});
    });

    yield shouldNotThrow(function*() {
      yield self.Topic.create({title: '标题'});
    });
  });

  describe('options', function () {
    opts['field'] = { field: 'topic_title' };
    it('field', function*() {
      const self = this;

      yield shouldNotThrow(function*() {
        yield self.Topic.create({topic_title: '标题'});
      });
    });

    opts['required'] = { required: false };
    it('required', function*() {
      const self = this;

      shouldNotThrow(function*() {
        yield self.Topic.create({});
      });
    });
  });
});
