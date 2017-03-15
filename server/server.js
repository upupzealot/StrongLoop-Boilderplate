'use strict';

var path = require('path');
var fs = require('fs');

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
app.start = function () {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }

    if (process.env.NODE_ENV === 'test') {
      const test = require('./test.js');
      test();
    } else {
      var bizBoot = path.resolve(__dirname, '../biz/boot');
      bootDir(bizBoot);
    }
  });
};

function bootDir (dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).filter((fileName) => {
      return path.extname(fileName) === '.js';
    }).forEach((fileName) => {
      var script = require(path.resolve(dir, `./${fileName}`));
      script(app);
    });
  }
}
var beforeBoot = path.resolve(__dirname, './boot/before');
bootDir(beforeBoot);

var afterBoot = path.resolve(__dirname, './boot/after');
var bootOpt = {
  appRootDir: __dirname,
  bootDirs: [afterBoot],
  mixinDirs: [path.resolve(__dirname, './mixins')],
};
if (process.env.NODE_ENV !== 'test') {
  bootOpt.dsRootDir = path.resolve(__dirname, '../biz/config/');
  bootOpt.modelsRootDir = path.resolve(__dirname, '../biz/');
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootOpt, (err) => {
  if (err) throw err;

  console.log('Loopback started');
  // start the server if `$ node server.js`
  if (require.main === module) { app.start(); }
});
