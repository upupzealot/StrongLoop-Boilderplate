'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const getModel = util.getMixinModel;
const remote = util.remote;
const testUsers = require('../lib/test-users');

describe('Mixin: SoftDelete', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  it('isDeleted', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        isDeleted: 'is_deleted',
      },
    });

    const count = yield Topic.count();
    let created = null;
    yield remote.post('/api/Topics');
    yield remote.post('/api/Topics')
            .then((topic) => {
              created = topic;
            });

    should(yield Topic.count()).equal(count + 2);
    should(created).be.ok();

    yield remote.delete(`/api/Topics/${created.id}`);
    let topic = yield Topic.findById(created.id);
    should(topic).not.be.ok();

    topic = yield Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok();

    let topics = yield Topic.find();
    should(topics.length).equal(count + 1);

    yield topic.updateAttributes({
      is_deleted: false,
    });
    topic = yield Topic.findById(created.id);
    should(topic).be.ok();

    topics = yield Topic.find();
    should(topics.length).equal(count + 2);
  });

  it('deletedAt', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        deletedAt: 'deleted_at',
      },
    });

    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });

    yield remote.delete(`/api/Topics/${created.id}`);

    yield Topic.findById(created.id);
    const topic = yield Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok()
      .which.has.property('deleted_at');
  });

  it('deletedBy', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        deletedBy: 'deleted_by',
      },
    });

    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });
    yield remote.delete(`/api/Topics/${created.id}?access_token=${this.tony.accessToken}`);

    let topic = yield Topic.findById(created.id);
    should(topic).not.be.ok();
    topic = yield Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok()
      .and.has.property('deleted_by')
      .which.equal(this.tony.id);
  });

  it('deletedIp', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        deletedIp: 'deleted_ip',
      },
    });

    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });
    yield remote.delete(`/api/Topics/${created.id}?access_token=${this.tony.accessToken}`);

    let topic = yield Topic.findById(created.id);
    should(topic).not.be.ok();
    topic = yield Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok()
      .which.has.property('deleted_ip');
  });
});
