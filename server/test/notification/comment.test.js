'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

const loopback = require('loopback');
const Subscription = loopback.getModel('Subscription');
const Notification = loopback.getModel('Notification');

describe('Notification: Comment', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  before(function () {
    this.Topic = mixinModel.getMixinModel(
      'Topic', {
        Marks: {
          createdBy: true,
          updatedBy: true,
        },
        AutoSubscription: {},
        NotificationTrigger: {
          create: true,
          update: false,
        },
        Commentable: {},
      });
  });

  beforeEach(function*() {
    yield Notification.deleteAll();
  });

  it('subscription on create', function*() {
    yield Subscription.deleteAll();
    yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);

    const count = yield Subscription.count();
    should(count).equal(1);
  });

  describe('comment', function () {
    before(function* () {
      yield Subscription.deleteAll();
      this.topic = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);
    });

    beforeEach(function*() {
      yield Notification.deleteAll();
    });

    describe('comment on commentable', function () {
      it('by creator', function*() {
        yield remote.post(
          `/api/Topics/${this.topic.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'comment content',
          });

        const count = yield Notification.count();
        should(count).equal(0); // slef comment triggers no notification
      });

      it('by other', function*() {
        yield remote.post(
          `/api/Topics/${this.topic.id}/comments?access_token=${this.steve.accessToken}`, {
            content: 'comment content',
          });

        const count = yield Notification.count();
        should(count).equal(1); // comment event
      });
    });

    describe('comment on fif', function () {
      before(function*() {
        this.comment =
          yield remote.post(
            `/api/Topics/${this.topic.id}/comments?access_token=${this.steve.accessToken}`, {
              content: 'comment content',
            });
      });

      it('by comment\'s creator', function*() {
        yield remote.post(
          `/api/Comments/${this.comment.id}/comments?access_token=${this.steve.accessToken}`, {
            content: 'fif content',
          });
        const count = yield Notification.count();
        should(count).equal(1);
        // 1 comment event

        // 0 reply event
      });

      it('by topic creator', function*() {
        yield remote.post(
          `/api/Comments/${this.comment.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'fif content',
          });
        const count = yield Notification.count();
        should(count).equal(1);
        // 0 comment event
        // 1 reply event
      });

      it('by other', function*() {
        yield Notification.deleteAll();
        yield remote.post(
          `/api/Comments/${this.comment.id}/comments?access_token=${this.bruce.accessToken}`, {
            content: 'fif content',
          });
        const count = yield Notification.count();
        should(count).equal(2);
        // 1 comment event
        // 1 reply event
      });
    });

    describe('comment on fif\'s comment', function () {
      before(function*() {
        this.comment =
          yield remote.post(
            `/api/Topics/${this.topic.id}/comments?access_token=${this.steve.accessToken}`, {
              content: 'comment content',
            });

        this.fif =
          yield remote.post(
            `/api/Comments/${this.comment.id}/comments?access_token=${this.bruce.accessToken}`, {
              content: 'fif content',
            });
      });

      it('by topic creator', function*() {
        yield remote.post(
          `/api/Comments/${this.fif.id}/comments?access_token=${this.tony.accessToken}`, {
            content: 'fif content',
          });

        const count = yield Notification.count();
        should(count).equal(2);
        // 0 comment event
        // 2 reply event:
        //  -reply on comment
        //  -reply on fif
      });

      it('by comment creator', function*() {
        yield remote.post(
          `/api/Comments/${this.fif.id}/comments?access_token=${this.steve.accessToken}`, {
            content: 'fif content',
          });

        const count = yield Notification.count();
        should(count).equal(2);
        // 1 comment event
        // 1 reply event
        //  -reply on fif
      });

      it('by fif creator', function*() {
        yield remote.post(
          `/api/Comments/${this.fif.id}/comments?access_token=${this.bruce.accessToken}`, {
            content: 'fif content',
          });

        const count = yield Notification.count();
        should(count).equal(2);
        // 1 comment event
        // 1 reply event
        //  -reply on comment
      });

      it('by other', function*() {
        yield remote.post(
          `/api/Comments/${this.fif.id}/comments?access_token=${this.natasha.accessToken}`, {
            content: 'fif content',
          });

        const count = yield Notification.count();
        should(count).equal(3);
        // 1 comment event
        // 2 reply event:
        //  -reply on comment
        //  -reply on fif
      });
    });
  });
});
