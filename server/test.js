'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const co = require('co');
const dir = require('node-dir');
const path = require('path');

const Mocha = require('mocha');
const mocha = new Mocha();

const testDir = path.resolve(__dirname, './test');

module.exports = () => {
  co(function*() {
    const files = yield (Promise.promisify(dir.files))(testDir);
    files.forEach((fileName) => {
      if (_.endsWith(fileName, '.test.js')) {
        mocha.addFile(fileName);
      }
    });

    console.log('\nTest start:');
    mocha.run((failures) => {
      process.on('exit', () => {
        process.exit(failures);
      });

      process.exit();
    });
  }).catch((err) => {
    console.error(err);
    process.exit();
  });
};
