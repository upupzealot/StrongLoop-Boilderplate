'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

const loopback = require('loopback');
const NotificationEvent = loopback.getModel('NotificationEvent');
const Subscription = loopback.getModel('Subscription');
const Notification = loopback.getModel('Notification');

describe('Model: NotificationEvent', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  before(function*() {
    this.Topic = mixinModel.getMixinModel('Topic');
    this.topic = yield this.Topic.create();
  });

  beforeEach(function*() {
    yield NotificationEvent.deleteAll();
    yield Subscription.deleteAll();
    yield Notification.deleteAll();
  });

  describe('push', function () {
    it('success', function*() {
      yield Subscription.create({
        user_id: this.steve.id,
        action: 'create',
        target_type: 'Topic',
        target_id: this.topic.id,
      });

      yield NotificationEvent.push({
        from_id: this.tony.id,
        action: 'create',
        target_type: 'Topic',
        target_id: this.topic.id,
      });

      const count = yield Notification.count({
        to_id: this.steve.id,
      });
      should(count).equal(1);
    });

    it('do not notify event owner self', function*() {
      yield Subscription.create({
        user_id: this.tony.id,
        action: 'create',
        target_type: 'Topic',
        target_id: this.topic.id,
      });

      yield NotificationEvent.push({
        from_id: this.tony.id,
        action: 'create',
        target_type: 'Topic',
        target_id: this.topic.id,
      });

      const count = yield Notification.count();
      should(count).equal(0);
    });
  });
});
