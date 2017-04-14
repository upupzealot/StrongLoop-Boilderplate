'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

describe('Mixin: Notificatable', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  const opts = {};
  beforeEach(function () {
    this.Topic = mixinModel.getMixinModel(
      'Topic', {
        Marks: {
          createdBy: true,
          updatedBy: true,
        },
        Notificatable: opts[this.currentTest.title],
      });

    const loopback = require('loopback');
    this.NotificationEvent = loopback.getModel('NotificationEvent');
  });

  afterEach(function*() {
    yield this.NotificationEvent.deleteAll();
  });

  describe('options', function () {
    opts['create'] = { create: true };
    it('create', function*() {
      yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
      const count = yield this.NotificationEvent.count();
      should(count).equal(1);
    });

    opts['update'] = { update: true };
    it('update', function*() {
      const created = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
      yield remote.patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`);

      const count = yield this.NotificationEvent.count();
      should(count).equal(1);
    });
  });

  describe('comment', function () {
    opts['comment'] = { create: true };
    it('comment', function*() {
      yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
      const count = yield this.NotificationEvent.count();
      should(count).equal(1);
    });
  });
});
