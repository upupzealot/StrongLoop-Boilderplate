'use strict';

const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');

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
  global.config.uploadConf = jsonfile.readFileSync(uploadConf);
};
