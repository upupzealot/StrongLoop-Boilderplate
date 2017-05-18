'use strict';

require('co-mocha')(require('mocha'));

const mixinModel = require('../lib/mixin-model');

describe('Mixin: Interestable', function () {
  const opts = {};
  beforeEach(mixinModel('Interestable', opts));
  beforeEach(function*() {
    this.topic = yield this.Topic.create();
  });

  it('test', function*() {
    console.log(this.topic.like);
    console.log(this.Topic.prototype.like);
  });
});
