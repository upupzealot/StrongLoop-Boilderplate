'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

const loopback = require('loopback');
const Subscription = loopback.getModel('Subscription');

describe('Mixin: AutoSubscription', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  beforeEach(function*() {
    yield Subscription.deleteAll();
  });

  describe('options', function () {
    before(function () {
      this.Topic = mixinModel.getMixinModel(
        'Topic', {
          Marks: {
            createdBy: true,
            updatedBy: true,
          },
          AutoSubscription: {},
        });
    });

    it('event on create', function*() {
      yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`);

      const count = yield Subscription.count();
      should(count).equal(1);
    });
  });
});
