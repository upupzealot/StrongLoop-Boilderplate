'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const loopback = require('loopback');

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const getModel = util.getMixinModel;

describe('Mixin: HTML Field', function () {
  it('field requirement', function*() {
    const Topic = getModel('Topic', {
      HtmlField: {},
    });

    yield shouldThrow(function*() {
      yield Topic.create({});
    });

    yield shouldNotThrow(function*() {
      yield Topic.create({content: 'abcdefghijklmnopqrstuvwxyz'});
    });
  });

  it('xss filter', function*() {
    const Topic = getModel('Topic', {
      HtmlField: {},
    });

    const topic = yield Topic.create({content: '<script>alert("xss");</script>'});
    should(topic.content).equal('&lt;script&gt;alert("xss");&lt;/script&gt;');
  });
});
