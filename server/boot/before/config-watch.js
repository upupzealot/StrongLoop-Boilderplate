'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const chokidar = require('chokidar');

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
  const bindProperty = function (filePath) {
    const fileName = path.basename(filePath, '.json');
    const key = _.camelCase(fileName);

    const value = jsonfile.readFileSync(filePath);
    _config[key] = _.merge(config[key], value);

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
  };

  const configDir = path.resolve(__dirname, '../../config');
  let files = fs.readdirSync(configDir);
  files.filter((file) => {
    return _.endsWith(file, '.json');
  }).forEach((file) => {
    const filePath = `${configDir}/${file}`;
    const fileName = path.basename(filePath, '.json');
    const key = _.camelCase(fileName);
    config[key] = jsonfile.readFileSync(filePath);
  });

  files = fs.readdirSync(bizConfigDir);
  files.filter((file) => {
    return _.endsWith(file, '.json');
  }).forEach((file) => {
    const filePath = `${bizConfigDir}/${file}`;
    bindProperty(filePath);
  });

  const bizConfigJsons = `${bizConfigDir}/*.json`;
  chokidar
    .watch(bizConfigJsons)
    .on('all', (event, filePath) => {
      const fileName = path.basename(filePath, '.json');
      const key = _.camelCase(fileName);
      if (event === 'add' && !config.hasOwnProperty(key)) {
        bindProperty(filePath);
      }
      if (event === 'change') {
        const value = jsonfile.readFileSync(filePath);
        _config[key] = _.merge(config[key], value);
      }
    });
};
