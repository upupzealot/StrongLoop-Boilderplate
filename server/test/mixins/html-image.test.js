'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const mixinModel = require('../lib/mixin-model');

describe('Mixin: Rich Text Image', function () {
  const opts = {};
  beforeEach(mixinModel('HtmlImage', opts));

  const instance = {
    content:
        '<p>' +
          '<img src="/test-img-0.jpeg">aaaaa' +
          '<img src="/test-img-1.jpeg"></img>' +
          '<img src="/test-img-2.jpeg"></img>' +
        '</p>',
  };

  opts['thumbnail filter'] = { thumbnail: 'thumbnail' };
  it('thumbnail filter', function*() {
    const topic = yield this.Topic.create(instance);
    should(topic.thumbnail).equal('/test-img-0.jpeg');
  });

  opts['gallery filter'] = { gallery: 'images' };
  it('gallery filter', function*() {
    const topic = yield this.Topic.create(instance);
    should(topic.images).be.an.Array()
      .which.eql([
        '/test-img-0.jpeg',
        '/test-img-1.jpeg',
        '/test-img-2.jpeg',
      ]);
  });

  opts['text filter'] = { text: 'text' };
  it('text filter', function*() {
    const topic = yield this.Topic.create(instance);
    should(topic.text).equal('[图片] aaaaa [图片]  [图片]');
  });

  describe('option', function () {
    opts['fromField'] = {
      fromField: 'html',
      thumbnail: 'aaaaa',
    };
    it('fromField', function*() {
      const self = this;

      shouldThrow(function*() {
        yield self.Topic.create(instance);
      });
      shouldNotThrow(function*() {
        const topic = yield self.Topic.create({
          html: instance.content,
        });
        should(topic.aaaaa).equal('/test-img-0.jpeg');
      });
    });
  });
});
