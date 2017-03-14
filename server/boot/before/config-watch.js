'use strict';

const _ = require('lodash');
const path = require('path');
const jsonfile = require('jsonfile');
const chokidar = require('chokidar');

const config = require('../../../biz/config');
const _config = {};

module.exports = (server) => {
  // const configJsons = path.resolve(__dirname, '../../config/*.json');
  const bizConfigJsons = path.resolve(__dirname, '../../../biz/config/*.json');
  chokidar
    .watch(bizConfigJsons)
    .on('all', (event, filePath) => {
      const fileName = path.basename(filePath, '.json');
      const key = _.camelCase(fileName);

      if (event === 'add' || event === 'change') {
        const value = jsonfile.readFileSync(filePath);
        _config[key] = value;
      }
      if (event === 'add') {
        Object.defineProperty(
          config,
          key, {
            get: () => {
              return _config[key];
            },
            set: (value) => {
              jsonfile.writeFileSync(filePath, value, {spaces: 2});
              _config[key] = value;
            },
          });
      }
    });
};
