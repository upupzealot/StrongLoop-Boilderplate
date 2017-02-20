'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

describe('Mixin: SoftDelete', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  const opts = {};
  beforeEach(mixinModel('Marks', opts));

  opts['isDeleted'] = { isDeleted: 'is_deleted' };
  it('isDeleted', function*() {
    const count = yield this.Topic.count();
    let created = null;
    yield remote.post('/api/Topics');
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });

    should(yield this.Topic.count()).equal(count + 2);
    should(created).be.ok();

    yield remote.delete(`/api/Topics/${created.id}`);
    let topic = yield this.Topic.findById(created.id);
    should(topic).not.be.ok();

    topic = yield this.Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok();

    let topics = yield this.Topic.find();
    should(topics.length).equal(count + 1);

    yield topic.updateAttributes({
      is_deleted: false,
    });
    topic = yield this.Topic.findById(created.id);
    should(topic).be.ok();

    topics = yield this.Topic.find();
    should(topics.length).equal(count + 2);
  });

  opts['deletedAt'] = { deletedAt: 'deleted_at' };
  it('deletedAt', function*() {
    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });

    yield remote.delete(`/api/Topics/${created.id}`);

    yield this.Topic.findById(created.id);
    const topic = yield this.Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok()
      .which.has.property('deleted_at');
  });

  opts['deletedBy'] = { deletedBy: 'deleted_by' };
  it('deletedBy', function*() {
    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });
    yield remote.delete(`/api/Topics/${created.id}?access_token=${this.tony.accessToken}`);

    let topic = yield this.Topic.findById(created.id);
    should(topic).not.be.ok();
    topic = yield this.Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok()
      .and.has.property('deleted_by')
      .which.equal(this.tony.id);
  });

  opts['deletedIp'] = { deletedIp: 'deleted_ip' };
  it('deletedIp', function*() {
    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        created = topic;
      });
    yield remote.delete(`/api/Topics/${created.id}?access_token=${this.tony.accessToken}`);

    let topic = yield this.Topic.findById(created.id);
    should(topic).not.be.ok();
    topic = yield this.Topic.findOne({
      where: {
        id: created.id,
        is_deleted: true,
      },
    });
    should(topic).be.ok()
      .which.has.property('deleted_ip');
  });
});
