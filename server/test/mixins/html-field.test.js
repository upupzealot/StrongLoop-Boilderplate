'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const mixinModel = require('../lib/mixin-model');

describe('Mixin: HTML Field', function () {
  const opts = {};
  beforeEach(mixinModel('HtmlField', opts));

  it('field requirement', function*() {
    const self = this;

    yield shouldThrow(function*() {
      yield self.Topic.create({});
    });

    yield shouldNotThrow(function*() {
      yield self.Topic.create({content: 'abcdefghijklmnopqrstuvwxyz'});
    });
  });

  it('xss filter', function*() {
    const topic = yield this.Topic.create({content: '<script>alert("xss");</script>'});

    should(topic.content).equal('&lt;script&gt;alert("xss");&lt;/script&gt;');
  });
});
