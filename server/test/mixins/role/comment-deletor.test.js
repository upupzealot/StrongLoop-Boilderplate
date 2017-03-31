'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../../lib/util');
const remote = util.remote;
const testUsers = require('../../lib/test-users');
const mixinModel = require('../../lib/mixin-model');

const loopback = require('loopback');
const Role = loopback.getModel('Role');

describe('Role: CommentDeletor', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  before(function*() {
    this.Topic = mixinModel.getMixinModel('Topic', {
      Marks: {
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
      Commentable: {},
    });

    const topic = yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`, {
      title: 'topic title',
      content: 'topic content',
    });
    this.topic = yield this.Topic.findById(topic.id);

    this.Comment = loopback.getModel('Comment');
    const comment = yield remote.post(`/api/Topics/${topic.id}/comments?access_token=${this.steve.accessToken}`, {
      content: 'comment content',
    });
    this.comment = yield this.Comment.findById(comment.id);

    const fif = yield remote.post(`/api/Comments/${comment.id}/comments?access_token=${this.bruce.accessToken}`, {
      content: 'fif content',
    });
    this.fif = yield this.Comment.findById(fif.id);
  });

  before(function*() {
    const self = this;
    self.isDeletor = function*(user) {
      return yield Role.isInRole('commentDeletor', {
        principalType: 'ROLE',
        principalId: 'commentDeletor',
        model: self.Comment,
        id: self.fif.id,
        accessToken: yield user.createAccessToken(),
      });
    };
  });

  it('commentable creator', function*() {
    const canDelete = yield this.isDeletor(this.tony);
    should(canDelete).be.ok();
  });

  it('parent creator', function*() {
    const canDelete = yield this.isDeletor(this.steve);
    should(canDelete).be.ok();
  });

  it('creator', function*() {
    const canDelete = yield this.isDeletor(this.bruce);
    should(canDelete).be.ok();
  });

  it('other', function*() {
    const canDelete = yield this.isDeletor(this.natasha);
    should(canDelete).not.be.ok();
  });
});
