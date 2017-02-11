'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const co = require('co');
const dir = require('node-dir');
const path = require('path');

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = loopback();

const Mocha = require('mocha');
const mocha = new Mocha();

const testDir = path.resolve(__dirname, './test');
const mixinDir = path.resolve(__dirname, './mixins');

boot(app, {
  mixinDirs: [path.resolve(__dirname, './mixins')],
}, function(err) {
  if (err) throw err;

  co(function*() {
    let files = yield (Promise.promisify(dir.files))(testDir);
    files.forEach((fileName)=>{
      if(_.endsWith(fileName, '.test.js')) {
        mocha.addFile(fileName);
      }
    });

    mocha.run(function(failures){
      process.on('exit', function () {
        process.exit(failures);  // exit with non-zero status if there were failures
      });
    });
  }).catch(console.err);
});
