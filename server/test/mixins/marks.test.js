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
  let accessToken = null;

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
      .post('/api/Topics?access_token=' + tony.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
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
      .post('/api/Topics?access_token=' + tony.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
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
      .post('/api/Topics?access_token=' + tony.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
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
      .post('/api/Topics?access_token=' + tony.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic)
          .have.property('created_at')
        should(topic)
          .have.property('updated_at');

        created = topic;
      });

    yield request(app)
      .patch('/api/Topics/' + created.id + '?access_token=' + tony.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic)
          .have.property('created_at')
          .which.equal(created.created_at)
        should(topic)
          .have.property('updated_at')
          .which.not.equal(created.created_at)
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
      .post('/api/Topics?access_token=' + tony.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic)
          .have.property('created_by')
        should(topic)
          .have.property('updated_by');

        created = topic;
      });

    yield request(app)
      .patch('/api/Topics/' + created.id + '?access_token=' + steve.accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic)
          .have.property('created_by')
          .which.equal(created.created_by)
        should(topic)
          .have.property('updated_by')
          .which.not.equal(created.created_by)
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
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic)
          .have.property('created_ip')
        should(topic)
          .have.property('updated_ip');

        created = topic;
      });

    yield request(app)
      .patch('/api/Topics')
      .set('Remote-Addr', '192.168.0.1')
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic)
          .have.property('created_ip')
          .which.equal(created.created_ip)
        should(topic)
          .have.property('updated_ip')
          //.which.not.equal(created.updated_ip)
          // TODO change ip test
      });
  });
});
