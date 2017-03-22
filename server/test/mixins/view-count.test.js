'use strict';

require('co-mocha')(require('mocha'));

const should = require('should');
const mixinModel = require('../lib/mixin-model');

describe('Mixin: ViewCount', function () {
  const opts = {};
  beforeEach(mixinModel('ViewCount', opts));

  it('field', function*() {
    should(this.Topic).have.property('viewById');
    const topic = yield this.Topic.create();
    should(topic).have.property('view_count')
      .which.equal(0);
  });

  it('counts', function*() {
    const topic = yield this.Topic.create();
    let viewed = yield this.Topic.viewById(topic.id);
    should(viewed).have.property('view_count')
      .which.equal(1);
    viewed = yield this.Topic.viewById(topic.id);
    should(viewed).have.property('view_count')
      .which.equal(2);
  });
});
