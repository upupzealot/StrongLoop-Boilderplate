'use strict';

const path = require('path');
const _ = require('lodash');

module.exports = (server)=>{
  // 开启 authentication
  server.enableAuth();

  // 设置模板引擎为 EJS
  server.set('views', path.resolve(__dirname, '../views'));
  server.set('view engine', 'ejs');
  server.use((req, res, next)=>{
    res.locals._ = _;
    res.locals._v = server.get('views');
    next();
  });
};
