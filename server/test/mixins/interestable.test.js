'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

const loopback = require('loopback');
const User = loopback.getModel('user');
const Interestable = require('../../mixins/interestable');

describe('Mixin: Interestable', function () {
  before(function() {
    Interestable(User);
  });
  before(testUsers.register);
  after(testUsers.unregister);

  const opts = {};
  beforeEach(mixinModel('Interestable', opts));
  beforeEach(function*() {
    this.topic = yield this.Topic.create();
  });

  describe('function register', function () {
    it('user model', function*() {
      should(this.tony.follow).be.a.Function();
      should(this.tony.unfollow).be.a.Function();
      should(this.tony.following).be.a.Function();
    });

    it('persisted model', function*() {
      should(this.topic.like).be.a.Function();
      should(this.topic.unlike).be.a.Function();
      should(this.topic.liking).be.a.Function();
    });
  });
});
