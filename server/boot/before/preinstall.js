'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const chokidar = require('chokidar');

module.exports = (server) => {
  const dataSourceConf = path.resolve(__dirname, '../../datasources.json');
  if (!fs.existsSync(dataSourceConf)) {
    jsonfile.writeFileSync(dataSourceConf, {
      db: {
        name: 'db',
        connector: 'memory',
      },
    }, {spaces: 2});
  }

  const uploadConf = path.resolve(__dirname, '../../config/upload-conf.json');
  if (!fs.existsSync(uploadConf)) {
    jsonfile.writeFileSync(uploadConf, {
      uploaders: {
        server: {
          rootPath: '/upload',
        },
      },
    }, {spaces: 2});
  }

  global.config = global.config || {};
  const config = global.config;

  const configDir = path.resolve(__dirname, '../../config/*.json');
  chokidar.watch(configDir).on('all', (event, filePath) => {
    const fileName = path.basename(filePath, '.json');
    const key = _.camelCase(fileName);
    config[key] = jsonfile.readFileSync(filePath);
  });
};
