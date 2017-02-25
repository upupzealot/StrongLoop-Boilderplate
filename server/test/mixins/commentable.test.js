'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

describe('Mixin: Commentable', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  const opts = {};
  beforeEach(mixinModel('Commentable', opts));

  describe('Relation', function () {
    it('comments field', function*() {
      const created = yield this.Topic.create({});
      let topic = yield this.Topic.findById(created.id, {include: 'comments'});

      should(topic).be.ok();
      topic = topic.toJSON();
      should(topic).has.property('comments')
        .which.is.an.Array();
    });

    it('create comments', function*() {
      const created = yield this.Topic.create({});
      yield remote.post(`/api/Topics/${created.id}/comments`, 422);
      yield remote.post(`/api/Topics/${created.id}/comments`, {content: 'hehe'});
      let topic = yield this.Topic.findById(created.id, {include: 'comments'});

      should(topic).be.ok();
      topic = topic.toJSON();
      should(topic).has.property('comments')
        .which.is.an.Array()
        .and.has.property('length')
        .which.equal(1);
    });

    it('create fif', function*() {
      const created = yield this.Topic.create({});
      const comment = yield remote.post(`/api/Topics/${created.id}/comments`, {content: 'hehe'});
      const fif = yield remote.post(`/api/Comments/${comment.id}/comments`, {content: 'haha'});

      should(fif).be.ok();
    });
  });
});
