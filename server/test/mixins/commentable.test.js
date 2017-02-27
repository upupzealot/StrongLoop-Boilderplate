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
    it('comments', function*() {
      const created = yield this.Topic.create({});
      let topic = yield this.Topic.findById(created.id, {include: 'comments'});

      should(topic).be.ok();
      topic = topic.toJSON();
      should(topic).has.property('comments')
        .which.is.an.Array();
    });

    describe('commentable', function () {
      it('comment\'s commentable', function*() {
        const topic = yield this.Topic.create({});
        const comment = yield topic.comments.create({content: 'haha'});
        const commentable = yield comment.commentable.getAsync();

        should(commentable).be.ok();
        should(commentable.toJSON()).eql(topic.toJSON());
      });

      it('fif\'s commentable', function*() {
        const topic = yield this.Topic.create({});
        const comment = yield topic.comments.create({content: 'aaa'});
        const fif = yield comment.comments.create({content: 'bbb'});
        const commentable = yield fif.commentable.getAsync();

        should(commentable).be.ok();
        should(commentable.toJSON()).eql(topic.toJSON());
      });
    });

    it('replied comment', function*() {
      const topic = yield this.Topic.create({});
      const comment = yield topic.comments.create({content: 'aaa'});
      const fif = yield comment.comments.create({content: 'bbb'});
      const replied = yield fif.replied.getAsync();

      should(replied).be.ok();
      should(replied.toJSON()).eql(comment.toJSON());
    });
  });

  describe('comments creation', function () {
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
