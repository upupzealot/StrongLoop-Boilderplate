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

  describe('Relation', function () {
    before(function*() {
      this.Topic = mixinModel.getMixinModel('Topic', { Commentable: {} });
      this.topic = yield this.Topic.create({});
      this.comment = yield this.topic.comments.create({content: 'root level comment'});
      this.fif = yield this.comment.comments.create({content: 'fif'});
      this.fifComment = yield this.fif.comments.create({content: 'fif\'s comment'});
    });

    it('comments', function*() {
      let topic = yield this.Topic.findById(this.topic.id, {include: 'comments'});

      should(topic).be.ok();
      topic = topic.toJSON();
      should(topic).has.property('comments')
        .which.is.an.Array();
    });

    describe('commentable', function () {
      it('comment\'s', function*() {
        const commentable = yield this.comment.commentable.getAsync();

        should(commentable).be.ok();
        should(commentable.toJSON()).eql(this.topic.toJSON());
      });

      it('fif\'s', function*() {
        const commentable = yield this.fif.commentable.getAsync();

        should(commentable).be.ok();
        should(commentable.toJSON()).eql(this.topic.toJSON());
      });

      it('fif\'s comment\'s', function*() {
        const commentable = yield this.fifComment.commentable.getAsync();

        should(commentable).be.ok();
        should(commentable.toJSON()).eql(this.topic.toJSON());
      });
    });

    describe('parent commnet', function () {
      it('comment\'s', function*() {
        const parent = yield this.comment.parent.getAsync();

        should(parent).not.be.ok();
      });

      it('fif\'s', function*() {
        const parent = yield this.fif.parent.getAsync();

        should(parent).be.ok();
        should(parent.toJSON()).eql(this.comment.toJSON());
      });

      it('fif\'s comment\'s', function*() {
        const parent = yield this.fifComment.parent.getAsync();

        should(parent).be.ok();
        should(parent.toJSON()).eql(this.comment.toJSON());
      });
    });

    describe('replied commnet', function () {
      it('comment\'s', function*() {
        const replied = yield this.comment.replied.getAsync();

        should(replied).not.be.ok();
      });

      it('fif\'s', function*() {
        const replied = yield this.fif.replied.getAsync();

        should(replied).be.ok();
        should(replied.toJSON()).eql(this.comment.toJSON());
      });

      it('fif\'s comment\'s', function*() {
        const replied = yield this.fifComment.replied.getAsync();

        should(replied).be.ok();
        should(replied.toJSON()).eql(this.fif.toJSON());
      });
    });
  });

  describe('comments creation', function () {
    beforeEach(mixinModel('Commentable', opts));

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
