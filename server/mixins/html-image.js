'use strict';

const _ = require('lodash');
const xss = require('xss');

module.exports = (Model, options) => {
  const opt = _.merge({}, {
    fromField: 'content',
    // thumbnailField: 'thumbnail',
    // galleryField: 'images',
    // textField: 'text',
  }, options);

  if (opt.thumbnailField) {
    Model.defineProperty(opt.thumbnailField, {
      type: String,
    });
  }
  if (opt.galleryField) {
    Model.defineProperty(opt.galleryField, {
      type: Object,
    });
  }
  if (opt.textField) {
    Model.defineProperty(opt.textField, {
      type: String,
    });
  }

  Model.observe('before save', (ctx, next) => {
    const instance = ctx.instance;
    const html = instance[opt.fromField];
    let thumbnail = null;
    const images = [];
    let text = '';
    if (html) {
      if (opt.thumbnailField || opt.galleryField) {
        xss(instance[opt.fromField], {
          onTagAttr: (tag, name, value, isWhiteAttr) => {
            if (tag === 'img' && name === 'src') {
              images.push(xss.friendlyAttrValue(value));
            }
          },
        });
        thumbnail = images.length ? images[0] : null;
      }

      if (opt.textField) {
        text = xss(html, {
          whiteList: [],
          stripIgnoreTag: true,
          onTag (tag, html, info) {
            if (tag === 'img') {
              if (_.startsWith(html, '</')) {
                return '';
              }
              return '[图片]';
            }
          },
        });
      }
    }

    if (opt.thumbnailField) {
      instance[opt.thumbnailField] = thumbnail;
    }
    if (opt.galleryField) {
      instance[opt.galleryField] = images;
    }
    if (opt.textField) {
      instance[opt.textField] = text;
    }
    next();
  });
};
