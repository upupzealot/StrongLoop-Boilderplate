'use strict';

require('co-mocha')(require('mocha'));
const should = require('should');
const loopback = require('loopback');

const util = require('../lib/util');
const shouldThrow = util.shouldThrow;
const shouldNotThrow = util.shouldNotThrow;
const getModel = util.getMixinModel;

describe('Mixin: Rich Text Image', function () {
  const instance = {
    content:
        '<p>' +
          '<img src="/test-img-0.jpeg">aaaaa' +
          '<img src="/test-img-1.jpeg"></img>' +
          '<img src="/test-img-2.jpeg"></img>' +
        '</p>',
  };

  it('thumbnail filter', function*() {
    const Topic = getModel('Topic', {
      HtmlImage: {
        thumbnailField: 'thumbnail',
      },
    });

    const topic = yield Topic.create(instance);
    should(topic.thumbnail).equal('/test-img-0.jpeg');
  });

  it('gallery filter', function*() {
    const Topic = getModel('Topic', {
      HtmlImage: {
        galleryField: 'images',
      },
    });

    const topic = yield Topic.create(instance);
    should(topic.images).be.an.Array()
      .which.eql([
        '/test-img-0.jpeg',
        '/test-img-1.jpeg',
        '/test-img-2.jpeg',
      ]);
  });

  it('text filter', function*() {
    const Topic = getModel('Topic', {
      HtmlImage: {
        textField: 'text',
      },
    });

    const topic = yield Topic.create(instance);
    should(topic.text).equal('[图片]aaaaa[图片][图片]');
  });

  describe('option', function () {
    it('fromField', function*() {
      const Topic = getModel('Topic', {
        HtmlImage: {
          fromField: 'html',
          thumbnailField: 'aaaaa',
        },
      });

      shouldThrow(function*() {
        const topic = yield Topic.create(instance);
      });
      shouldNotThrow(function*() {
        const topic = yield Topic.create({
          html: instance.content,
        });
        should(topic.aaaaa).equal('/test-img-0.jpeg');
      });
    });
  });
});
