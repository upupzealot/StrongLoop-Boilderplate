'use strict';

const _ = require('lodash');
const xss = require('xss');

module.exports = (Model, options) => {
  const opt = _.merge({}, {
    from: 'content',
    // thumbnail: 'thumbnail',
    // gallery: 'images',
    // text: 'text',
  }, options);

  if (opt.thumbnail) {
    Model.defineProperty(opt.thumbnail, {
      type: String,
    });
  }
  if (opt.gallery) {
    Model.defineProperty(opt.gallery, {
      type: Object,
    });
  }
  if (opt.text) {
    Model.defineProperty(opt.text, {
      type: String,
    });
  }

  Model.observe('before save', (ctx, next) => {
    const instance = ctx.instance;
    const html = instance[opt.from];
    let thumbnail = null;
    const images = [];
    let text = '';
    if (html) {
      if (opt.thumbnail || opt.gallery) {
        xss(instance[opt.from], {
          onTagAttr: (tag, name, value, isWhiteAttr) => {
            if (tag === 'img' && name === 'src') {
              images.push(xss.friendlyAttrValue(value));
            }
          },
        });
        thumbnail = images.length ? images[0] : null;
      }

      if (opt.text) {
        text = xss(html, {
          whiteList: [],
          stripIgnoreTag: true,
          onTag (tag, html, info) {
            if (tag === 'img') {
              if (_.startsWith(html, '</')) {
                return '';
              }
              return ' [图片] ';
            } else {
              return ' ';
            }
          },
        }).trim();
      }
    }

    if (opt.thumbnail) {
      instance[opt.thumbnail] = thumbnail;
    }
    if (opt.gallery) {
      instance[opt.gallery] = images;
    }
    if (opt.text) {
      instance[opt.text] = text;
    }
    next();
  });
};
