'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const loopback = require('loopback');

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const getModel = util.getMixinModel;

const app = util.app;
const request = util.request;

describe('Mixin: Marks', function () {
  let tony = null;
  let steve = null;
  const accessToken = null;

  before(function*() {
    const User = loopback.getModel('user');
    tony = yield User.create({
      username: 'tony',
      email: 'tony@stark-industry.com',
      password: 'tonystark0529',
    });
    tony.accessToken = (yield tony.createAccessToken()).id;

    steve = yield User.create({
      username: 'steve',
      email: 'steve@us-army.us.gov',
      password: 'steverogers0704',
    });
    steve.accessToken = (yield steve.createAccessToken()).id;
  });

  it('createdAt', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdAt: 'created_at',
      },
    });
    yield request(app)
      .post(`/api/Topics?access_token=${tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic).have.property('created_at');
      });
  });

  it('createdBy', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdBy: 'created_by',
      },
    });
    yield request(app)
      .post(`/api/Topics?access_token=${tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic).have.property('created_by').which.equal(tony.id);
      });
  });

  it('createdIp', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdIp: 'created_ip',
      },
    });
    yield request(app)
      .post(`/api/Topics?access_token=${tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic).have.property('created_ip').which.equal('127.0.0.1');
      });
  });

  it('updatedAt', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    });

    let created = null;
    yield request(app)
      .post(`/api/Topics?access_token=${tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic)
          .have.property('created_at');
        should(topic)
          .have.property('updated_at');

        created = topic;
      });

    yield request(app)
      .patch(`/api/Topics/${created.id}?access_token=${tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic)
          .have.property('created_at')
          .which.equal(created.created_at);
        should(topic)
          .have.property('updated_at')
          .which.not.equal(created.created_at);
      });
  });

  it('updatedBy', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdBy: 'created_by',
        updatedBy: 'updated_by',
      },
    });

    let created = null;
    yield request(app)
      .post(`/api/Topics?access_token=${tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic)
          .have.property('created_by');
        should(topic)
          .have.property('updated_by');

        created = topic;
      });

    yield request(app)
      .patch(`/api/Topics/${created.id}?access_token=${steve.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic)
          .have.property('created_by')
          .which.equal(created.created_by);
        should(topic)
          .have.property('updated_by')
          .which.not.equal(created.created_by);
      });
  });

  it('updatedIp', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdIp: 'created_ip',
        updatedIp: 'updated_ip',
      },
    });

    let created = null;
    yield request(app)
      .post('/api/Topics')
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic)
          .have.property('created_ip');
        should(topic)
          .have.property('updated_ip');

        created = topic;
      });

    created = yield Topic.findById(created.id);
    created = yield created.updateAttributes({
      created_ip: '999.999.999.999',
      updated_ip: '999.999.999.999',
    });
    yield request(app)
      .patch(`/api/Topics/${created.id}?access_token=${steve.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic)
          .have.property('created_ip')
          .which.equal(created.created_ip);
        should(topic)
          .have.property('updated_ip')
          .which.not.equal(created.updated_ip);
      });
  });

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

    const topics = yield Topic.find();
    should(topics.length).equal(count + 1);
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
      .delete(`/api/Topics/${created.id}?access_token=${tony.accessToken}`)
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
      .which.equal(tony.id);
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
