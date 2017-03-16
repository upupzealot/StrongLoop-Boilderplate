'use strict';

const _ = require('lodash');
const co = require('co');
const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');
const Promise = require('bluebird');

const config = require('../config/index.js');

module.exports = (User, options) => {
  const avatarDir = path.resolve(__dirname, '../../client', config.userAvatarMixin.avatarDir);
  if (!fs.existsSync(avatarDir)) {
    fs.mkdir(avatarDir);
  }

  const encodePNG = Promise.promisify((img, fileName, callback) => {
    PImage.encodePNG(
      img,
      fs.createWriteStream(fileName),
      (err) => {
        callback(err, fileName);
      });
  });

  const SIZE = config.userAvatarMixin.size;
  const FONT = PImage.registerFont(
    path.resolve(__dirname, '../../client', config.userAvatarMixin.font),
    'AVATAR FONT');
  FONT.loadSync();
  const BGCOLORS = config.userAvatarMixin.backgroundColors;

  User.observe('after save', (ctx, next) => {
    co(function*() {
      if (ctx.instance && !ctx.instance.avatar) {
        const user = ctx.instance;
        const avatar = PImage.make(SIZE, SIZE);
        const g2d = avatar.getContext('2d');
        g2d.fillStyle = BGCOLORS[_.random(BGCOLORS.length - 1)];
        // g2d.fillRect(0, 0, SIZE, SIZE);
        g2d.fillRect(-1, -1, SIZE + 1, SIZE + 1);
        g2d.fillStyle = '#FFFFFF';
        g2d.setFont('AVATAR FONT', config.userAvatarMixin.fontSize);

        const name = user.username.substr(0, 1).toUpperCase();
        const dimention = g2d.measureText(name);
        dimention.height = dimention.emHeightAscent + dimention.emHeightDescent;
        g2d.fillText(
          name,
          (SIZE - dimention.width) / 2 + 1,
          (SIZE - dimention.height / 2));

        const avatarDir = path.resolve(__dirname, '../../client', config.userAvatarMixin.avatarDir);
        const file = yield encodePNG(avatar, `${avatarDir}/avatar-${user.id}.png`);
        yield user.updateAttribute('avatar', `/${path.basename(avatarDir)}/${path.relative(avatarDir, file)}`);
      }
      next();
    }).catch((err) => {
      console.error(err);
      next(err);
    });
  });
};
