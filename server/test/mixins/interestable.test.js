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

  describe('interest', function () {
    before(function*() {
      this.Interest = loopback.getModel('Interest');
    });

    beforeEach(function*() {
      yield this.Interest.deleteAll();
    });

    it('like', function*() {
      yield this.topic.like(this.tony.id);

      const count = yield this.Interest.count({
        created_by: this.tony.id,
        interestable_type: this.Topic.modelName,
        interestable_id: this.topic.id,
        is_canceled: false,
      });
      should(count).equal(1);
    });

    it('unlike', function*() {
      yield this.topic.like(this.tony.id);
      yield this.topic.unlike(this.tony.id);

      const count = yield this.Interest.count({
        created_by: this.tony.id,
        interestable_type: this.Topic.modelName,
        interestable_id: this.topic.id,
        is_canceled: true,
      });
      should(count).equal(1);
    });

    it('isliking', function*() {
      let isLiking = yield this.topic.liking(this.tony.id);
      should(isLiking).equal(false);

      yield this.topic.like(this.tony.id);

      isLiking = yield this.topic.liking(this.tony.id);
      should(isLiking).equal(true);

      yield this.topic.unlike(this.tony.id);

      isLiking = yield this.topic.liking(this.tony.id);
      should(isLiking).equal(false);
    });
  });
});
