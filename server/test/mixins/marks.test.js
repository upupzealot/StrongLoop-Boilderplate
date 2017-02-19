'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const loopback = require('loopback');

const util = require('../lib/util');
const getModel = util.getMixinModel;

const testUsers = require('../lib/test-users');

const app = util.app;
const request = util.request;

describe('Mixin: Marks', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  it('createdAt', function*() {
    getModel('Topic', {
      Marks: {
        createdAt: 'created_at',
      },
    });
    yield request(app)
      .post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic).have.property('created_at');
      });
  });

  it('createdBy', function*() {
    getModel('Topic', {
      Marks: {
        createdBy: 'created_by',
      },
    });
    yield request(app)
      .post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic).have.property('created_by').which.equal(this.tony.id);
      });
  });

  it('createdIp', function*() {
    getModel('Topic', {
      Marks: {
        createdIp: 'created_ip',
      },
    });
    yield request(app)
      .post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .send({})
      .then((res) => {
        should(res).have.property('status').which.equal(200);
        const topic = res.body;
        should(topic).have.property('created_ip').which.equal('127.0.0.1');
      });
  });

  it('updatedAt', function*() {
    getModel('Topic', {
      Marks: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    });

    let created = null;
    yield request(app)
      .post(`/api/Topics?access_token=${this.tony.accessToken}`)
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
      .patch(`/api/Topics/${created.id}?access_token=${this.tony.accessToken}`)
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
    getModel('Topic', {
      Marks: {
        createdBy: 'created_by',
        updatedBy: 'updated_by',
      },
    });

    let created = null;
    yield request(app)
      .post(`/api/Topics?access_token=${this.tony.accessToken}`)
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
      .patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`)
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
      .patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`)
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
});
