'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

module.exports = (server)=>{
  // 设置模板引擎为 EJS
  server.set('views', path.resolve(__dirname, '../../views'));
  server.set('view engine', 'ejs');
  server.use((req, res, next)=>{
    res.locals._ = _;
    res.locals._v = server.get('views');
    next();
  });

  let routerDir = path.resolve(__dirname, '../../router');
  let router = server.loopback.Router();
  fs.readdirSync(routerDir)
  .filter(function(fileName) {
    return path.extname(fileName) === '.js';
  }).forEach(function(fileName) {
    require(routerDir + '/' + fileName)(router, server);
  });
  server.use(router);
};
