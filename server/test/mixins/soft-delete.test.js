'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const getModel = util.getMixinModel;
const app = util.app;
const request = util.request;
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
    yield request(app)
      .post('/api/Topics')
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
      });

    yield request(app)
      .post('/api/Topics')
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        created = res.body;
      });

    should(yield Topic.count()).equal(count + 2);
    should(created).be.ok();

    yield request(app)
      .delete(`/api/Topics/${created.id}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
      });

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
    yield request(app)
      .post('/api/Topics')
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        created = res.body;
      });

    yield request(app)
      .delete(`/api/Topics/${created.id}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
      });

    let topic = yield Topic.findById(created.id);
    should(topic).not.be.ok();
    topic = yield Topic.findOne({
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
    yield request(app)
      .post('/api/Topics')
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        created = res.body;
      });

    yield request(app)
      .delete(`/api/Topics/${created.id}?access_token=${this.tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
      });

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
    yield request(app)
      .post('/api/Topics')
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        created = res.body;
      });

    yield request(app)
      .delete(`/api/Topics/${created.id}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
      });

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
