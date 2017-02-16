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
  let accessToken = null;

  before(function*() {
    const User = loopback.getModel('user');
    tony = yield User.create({
      username: 'tony',
      email: 'tony@stark-industry.com',
      password: 'tonystark0529',
    });
    accessToken = (yield tony.createAccessToken()).id;
  });

  it('createdAt', function*() {
    const Topic = getModel('Topic', {
      Marks: {
        createdAt: 'created_at',
      },
    });
    yield request(app)
      .post('/api/Topics?access_token=' + accessToken)
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
      .post('/api/Topics?access_token=' + accessToken)
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
      .post('/api/Topics?access_token=' + accessToken)
      .send({})
      .then((res)=>{
        should(res).have.property('status').which.equal(200);
        let topic = res.body;
        should(topic).have.property('created_ip').which.equal('127.0.0.1');
      });
  });
});
