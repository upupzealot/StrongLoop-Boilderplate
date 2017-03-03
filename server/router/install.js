'use strict';

const path = require('path');
const jsonfile = require('jsonfile');
const loopback = require('loopback');
const co = require('co');
const cookieSignature = require('cookie-signature');

// 调用失败时的返回错误信息
const onError = (err, res) => {
  res.status(500);
  res.json({
    success: false,
    msg: err.toString(),
  });
};

module.exports = (router, server) => {
  router.get('/install/admin', (req, res) => {
    res.render('page/install/admin');
  });
  router.post('/install/admin', (req, res) => {
    co(function*() {
      const User = loopback.getModel('user');
      const Role = loopback.getModel('Role');
      const RoleMapping = loopback.getModel('RoleMapping');

      // 创建管理员用户
      const adminData = req.body;
      // TODO: 后端验证 可暂时省略
      const user = yield User.create(adminData);

      // 创建管理员角色
      const adminRole = {name: 'admin'};
      let role = yield Role.findOne({where: adminRole});
      if (!role) {
        role = yield Role.create(adminRole);
      }

      // 赋予新建的管理员角色
      yield role.principals.create({
        principalType: RoleMapping.USER,
        principalId: user.id,
      });

      // 产生 token
      const token = yield user.createAccessToken(1000 * 3600 * 24 * 7);
      const signature = `s:${cookieSignature.sign(token.id, '***')}`;
      res.cookie('authorization', signature);

      return res.json({
        success: true,
      });
    }).catch(err => {
      onError(err, res);
    });
  });

  // 数据库配置
  router.get('/install/datasource', (req, res) => {
    res.render('page/install/datasource');
  });
  router.post('/install/datasource', (req, res) => {
    co(function*() {
      const dbConf = req.body.db;
      const db = loopback.registry.createDataSource('db', dbConf);
      db.ping((err) => {
        if (err) {
          return onError(err, res);
        }

        // 用 confirm 字段来区分 test 和 confirm 情况
        // conform 的情况下需要：

        var confirm = req.body.confirm;
        // 1.将配置写入 datasources.json 配置文件
        if (confirm) {
          const file = path.resolve(__dirname, '../datasources.json');
          jsonfile.writeFileSync(file, {db: dbConf}, {spaces: 2});
        }

        // 2.返回
        res.json({
          success: true,
        });

        // 3.重启服务
        if (confirm) {
          return process.exit();
        }
      });
    }).catch(err => {
      onError(err, res);
    });
  });

  // 配置上传方式
  router.get('/install/uploader', (req, res) => {
    res.render('page/install/uploader');
  });

  router.post('/install/uploader', (req, res) => {
    co(function*() {
      const file = path.resolve(__dirname, '../config/upload-conf.json');
      const uploadConf = jsonfile.readFileSync(file);

      const uploader = req.body.uploader;
      const connector = uploader.connector;
      delete uploader.connector;
      uploadConf.uploaders[connector] = uploader;
      uploadConf.default = connector;

      jsonfile.writeFileSync(file, uploadConf, {spaces: 2});

      res.json({
        success: true,
      });
    }).catch(err => {
      onError(err, res);
    });
  });

  router.get('/status', server.loopback.status());
};
