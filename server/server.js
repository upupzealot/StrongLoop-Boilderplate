'use strict';

var path = require('path');
var fs = require('fs');

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

var beforeBoot = path.resolve(__dirname, './boot/before');
fs.readdirSync(beforeBoot).filter(function(fileName) {
    return path.extname(fileName) === '.js';
}).forEach(function(fileName) {
  var beforeScript = require(path.resolve(beforeBoot, './' + fileName));
  beforeScript(app);
});

var afterBoot = path.resolve(__dirname, './boot/after');
var bootOpt = {
  appRootDir: __dirname,
  bootDirs: [afterBoot]
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootOpt, function(err) {
  if (err) throw err;

  console.log('Loopback started');
  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
