'use strict';

const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');

module.exports = (server) => {
  const configDir = path.resolve(__dirname, '../../../biz/config');

  const dataSourceConf = `${configDir}/datasources.json`;
  if (!fs.existsSync(dataSourceConf)) {
    jsonfile.writeFileSync(dataSourceConf, {
      db: {
        name: 'db',
        connector: 'memory',
      },
    }, {spaces: 2});
  }

  const uploadConf = `${configDir}/upload-conf.json`;
  if (!fs.existsSync(uploadConf)) {
    jsonfile.writeFileSync(uploadConf, {
      uploaders: {
        server: {
          rootPath: '/upload',
        },
      },
    }, {spaces: 2});
  }
};
