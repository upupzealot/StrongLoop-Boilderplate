'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const co = require('co');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const chokidar = require('chokidar');
const dir = require('node-dir');

const bizConfigDir = path.resolve(__dirname, '../../../biz/config');
if (!fs.existsSync(bizConfigDir)) {
  fs.mkdirSync(bizConfigDir);
}
const bizConfigIndex = `${bizConfigDir}/index.js`;
if (!fs.existsSync(bizConfigIndex)) {
  fs.writeFileSync(bizConfigIndex,
    '/* auto generated */\n' +
    '\'use strict\'\n' +
    '\n' +
    'const config = require(\'../../server/config/index.js\');\n' +
    'module.exports = config;\n');
}
const config = require('../../config/index.js');
const _config = {};

module.exports = (server) => {
  co(function*() {
    const configDir = path.resolve(__dirname, '../../config');
    const files = yield (Promise.promisify(dir.files))(configDir);
    files.forEach((filePath) => {
      if (_.endsWith(filePath, '.json')) {
        const fileName = path.basename(filePath, '.json');
        const key = _.camelCase(fileName);
        config[key] = jsonfile.readFileSync(filePath);
      }
    });
  }).catch(console.error);

  const bizConfigJsons = `${bizConfigDir}/*.json`;
  chokidar
    .watch(bizConfigJsons)
    .on('all', (event, filePath) => {
      const fileName = path.basename(filePath, '.json');
      const key = _.camelCase(fileName);

      if (event === 'add' || event === 'change') {
        const value = jsonfile.readFileSync(filePath);
        _config[key] = _.merge(config[key], value);
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
              this[key] = value;
              _config[key] = value;
            },
          });
      }
    });
};
