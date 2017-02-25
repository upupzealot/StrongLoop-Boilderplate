'use strict';

require('co-mocha')(require('mocha'));
const _ = require('lodash');
const should = require('should');
const request = require('supertest');

const app = require('../../server.js');

const remoteFuns = (method) => {
  return function (url, body, code) {
    if (_.isNumber(body)) {
      code = body;
      body = {};
    }
    body = body || {};
    code = code || 200;

    return request(app)[method](url)
        .send(body)
        .then((res) => {
          should(res).have.property('status').which.equal(code);
          return res.body;
        });
  };
};

module.exports = {
  app,
  request,

  remote: {
    delete: remoteFuns('delete'),
    get: remoteFuns('get'),
    patch: remoteFuns('patch'),
    post: remoteFuns('post'),
  },

  *shouldThrow (generatorFunc) {
    let err = null;
    try {
      yield generatorFunc();
    } catch (e) {
      err = e;
    }
    should(err).be.ok();
  },

  *shouldNotThrow (generatorFunc) {
    let err = null;
    try {
      yield generatorFunc();
    } catch (e) {
      err = e;
    }
    should(err).not.be.ok();
  },
};
