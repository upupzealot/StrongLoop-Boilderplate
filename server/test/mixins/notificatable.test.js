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
    const loopback = require('loopback');
    this.NotificationEvent = loopback.getModel('NotificationEvent');
  });

  describe('options', function () {
    beforeEach(function () {
      this.Topic = mixinModel.getMixinModel(
        'Topic', {
          Marks: {
            createdBy: true,
            updatedBy: true,
          },
          Notificatable: opts[this.currentTest.title],
        });
    });

    opts['create'] = { create: true };
    it('create', function*() {
      yield this.NotificationEvent.deleteAll();
      yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
      const count = yield this.NotificationEvent.count();
      should(count).equal(1);
    });

    opts['update'] = { update: true };
    it('update', function*() {
      yield this.NotificationEvent.deleteAll();
      const created = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
      yield remote.patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`);

      const count = yield this.NotificationEvent.count();
      should(count).equal(1);
    });
  });

  describe('comment', function () {
    beforeEach(function* () {
      this.Topic = mixinModel.getMixinModel(
        'Topic', {
          Marks: {
            createdBy: true,
            updatedBy: true,
          },
          Notificatable: opts[this.currentTest.title],
          Commentable: {},
        });
      this.created = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
    });

    opts['comment'] = { create: true };
    it('comment', function*() {
      yield this.NotificationEvent.deleteAll();
      yield remote.post(
        `/api/Topics/${this.created.id}/comments?access_token=${this.tony.accessToken}`, {
          content: 'comment content',
        });

      const count = yield this.NotificationEvent.count();
      should(count).equal(1); // comment event
    });

    it('fif', function*() {
      const comment =
        yield remote.post(
          `/api/Topics/${this.created.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'comment content',
          });

      yield this.NotificationEvent.deleteAll();
      yield remote.post(
        `/api/Comments/${comment.id}/comments?access_token=${this.tony.accessToken}`, {
          content: 'fif content',
        });

      const count = yield this.NotificationEvent.count();
      should(count).equal(2); // comment event & reply event;
    });

    it('fif\'s comment', function*() {
      const comment =
        yield remote.post(
          `/api/Topics/${this.created.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'comment content',
          });
      const fif =
        yield remote.post(
          `/api/Comments/${comment.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'fif content',
          });

      yield this.NotificationEvent.deleteAll();
      yield remote.post(
        `/api/Comments/${fif.id}/comments?access_token=${this.tony.accessToken}`, {
          content: 'fif content',
        });
      const count = yield this.NotificationEvent.count();
      should(count).equal(3);
      // 1 comment event
      // 2 reply event:
      //   reply comment
      //   reply fif
    });
  });
});
