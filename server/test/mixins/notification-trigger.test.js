'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

const loopback = require('loopback');
const NotificationEvent = loopback.getModel('NotificationEvent');

describe('Mixin: NotificationTrigger', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  const opts = {};
  beforeEach(function*() {
    yield NotificationEvent.deleteAll();
  });

  describe('options', function () {
    beforeEach(function () {
      this.Topic = mixinModel.getMixinModel(
        'Topic', {
          Marks: {
            createdBy: true,
            updatedBy: true,
          },
          NotificationTrigger: opts[this.currentTest.title],
        });
    });

    opts['event on create'] = { create: true, update: false };
    it('event on create', function*() {
      yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);

      const count = yield NotificationEvent.count();
      should(count).equal(1);
    });

    opts['event on update'] = { create: false, update: true };
    it('event on update', function*() {
      const created = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
      yield remote.patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`);

      const count = yield NotificationEvent.count();
      should(count).equal(1);
    });
  });

  describe('comment', function () {
    before(function* () {
      this.Topic = mixinModel.getMixinModel(
        'Topic', {
          Marks: {
            createdBy: true,
            updatedBy: true,
          },
          NotificationTrigger: {
            create: true,
          },
          Commentable: {},
        });
      this.created = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
    });

    it('comment', function*() {
      yield remote.post(
        `/api/Topics/${this.created.id}/comments?access_token=${this.tony.accessToken}`, {
          content: 'comment content',
        });

      const count = yield NotificationEvent.count();
      should(count).equal(1); // comment event
    });

    it('fif', function*() {
      const comment =
        yield remote.post(
          `/api/Topics/${this.created.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'comment content',
          });

      yield NotificationEvent.deleteAll();
      yield remote.post(
        `/api/Comments/${comment.id}/comments?access_token=${this.tony.accessToken}`, {
          content: 'fif content',
        });

      const count = yield NotificationEvent.count();
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

      yield NotificationEvent.deleteAll();
      yield remote.post(
        `/api/Comments/${fif.id}/comments?access_token=${this.tony.accessToken}`, {
          content: 'fif content',
        });

      const count = yield NotificationEvent.count();
      should(count).equal(3);
      // 1 comment event
      // 2 reply event:
      //   reply comment
      //   reply fif
    });
  });
});
