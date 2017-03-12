'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const co = require('co');
const moment = require('moment');

const loopback = require('loopback');
const User = loopback.getModel('user');

module.exports = (server) => {
  // 设置模板引擎为 EJS
  const viewDir = path.resolve(__dirname, '../../views');
  const bizViewDir = path.resolve(__dirname, '../../../biz/views');
  server.set('views', [
    bizViewDir,
    viewDir,
  ]);
  server.set('view engine', 'ejs');
  server.use((req, res, next) => {
    co(function*() {
      res.locals._v = viewDir;
      next();
    }).catch(next);
  });

  const router = server.loopback.Router();
  const setupRouterDir = (dir) => {
    fs.readdirSync(dir)
    .filter((fileName) => {
      return path.extname(fileName) === '.js';
    }).forEach((fileName) => {
      require(`${dir}/${fileName}`)(router, server);
    });
  };
  if (process.env.NODE_ENV !== 'test') {
    const bizRouterDir = path.resolve(__dirname, '../../../biz/router');
    setupRouterDir(bizRouterDir);
  }
  const routerDir = path.resolve(__dirname, '../../router');
  setupRouterDir(routerDir);

  server.use(router);
};
