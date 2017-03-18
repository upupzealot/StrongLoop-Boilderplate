'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const remote = util.remote;
const testUsers = require('../lib/test-users');
const mixinModel = require('../lib/mixin-model');

describe('Mixin: Marks', function () {
  before(testUsers.register);
  after(testUsers.unregister);

  const opts = {};
  beforeEach(mixinModel('Marks', opts));

  opts['createdAt'] = { createdAt: true };
  it('createdAt', function*() {
    yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .then((topic) => {
        should(topic).have.property('created_at');
      });
  });

  opts['createdBy'] = { createdBy: true };
  it('createdBy', function*() {
    let created = null;
    yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .then((topic) => {
        should(topic).have.property('created_by')
          .which.equal(this.tony.id);

        created = topic;
      });

    created = yield this.Topic.findById(created.id);
    const creator = yield created.creator.getAsync();
    should(creator).be.ok()
      .and.have.property('id')
      .which.equal(this.tony.id);
  });

  opts['createdIp'] = { createdIp: true };
  it('createdIp', function*() {
    yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .then((topic) => {
        should(topic).have.property('created_ip')
          .which.equal('127.0.0.1');
      });
  });

  opts['updatedAt'] = {
    createdAt: true,
    updatedAt: true,
  };
  it('updatedAt', function*() {
    let created = null;
    yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .then((topic) => {
        should(topic)
          .have.property('created_at');
        should(topic)
          .have.property('updated_at');

        created = topic;
      });

    yield remote.patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`)
      .then((topic) => {
        should(topic)
          .have.property('created_at')
          .which.equal(created.created_at);
        should(topic)
          .have.property('updated_at')
          .which.not.equal(created.created_at);
      });
  });

  opts['updatedBy'] = {
    createdBy: true,
    updatedBy: true,
  };
  it('updatedBy', function*() {
    let created = null;
    yield remote.post(`/api/Topics?access_token=${this.tony.accessToken}`)
      .then((topic) => {
        should(topic)
          .have.property('created_by');
        should(topic)
          .have.property('updated_by');

        created = topic;
      });

    yield remote.patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`)
      .then((topic) => {
        should(topic)
          .have.property('created_by')
          .which.equal(created.created_by);
        should(topic)
          .have.property('updated_by')
          .which.not.equal(created.created_by);
      });

    created = yield this.Topic.findById(created.id);
    const updator = yield created.updator.getAsync();
    should(updator).be.ok()
      .and.have.property('id')
      .which.equal(this.steve.id);
  });

  opts['updatedIp'] = {
    createdIp: true,
    updatedIp: true,
  };
  it('updatedIp', function*() {
    let created = null;
    yield remote.post('/api/Topics')
      .then((topic) => {
        should(topic)
          .have.property('created_ip');
        should(topic)
          .have.property('updated_ip');

        created = topic;
      });

    created = yield this.Topic.findById(created.id);
    created = yield created.updateAttributes({
      created_ip: '999.999.999.999',
      updated_ip: '999.999.999.999',
    });
    yield remote.patch(`/api/Topics/${created.id}?access_token=${this.steve.accessToken}`)
      .then((topic) => {
        should(topic)
          .have.property('created_ip')
          .which.equal(created.created_ip);
        should(topic)
          .have.property('updated_ip')
          .which.not.equal(created.updated_ip);
      });
  });
});
