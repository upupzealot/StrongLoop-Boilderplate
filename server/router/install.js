'use strict';

const path = require('path');
const jsonfile = require('jsonfile');
const loopback = require('loopback');
const co = require('co');
const Promise = require('bluebird');

// 调用失败时的返回错误信息
let onError = (err, res)=>{
  res.status(500);
  res.json({
    success: false,
    msg: err.toString(),
  });
}

module.exports = (router, server)=>{
  router.get('/install/admin', (req, res)=>{
    res.render('page/install/admin');
  });
  router.post('/install/admin', (req, res)=>{
    co(function*() {
      let User = loopback.getModel('user');
      let Role = loopback.getModel('Role');
      let RoleMapping = loopback.getModel('RoleMapping');

      // 创建管理员用户
      let adminData = req.body;
      // TODO: 后端验证 可暂时省略
      let user = yield User.create(adminData);

      // 创建管理员角色
      let adminRole = {name: 'admin'};
      let role = yield Role.findOne({where: adminRole});
      if(!role) {
        role = yield Role.create(adminRole);
      }

      // 赋予新建的管理员角色
      let principal = yield role.principals.create({
        principalType: RoleMapping.USER,
        principalId: user.id
      });

      return res.json({
        success: true
      });
    }).catch(err=>{
      onError(err, res);
    });
  });

  // 数据库配置
  router.get('/install/datasource', (req, res)=>{
    res.render('page/install/datasource');
  });
  router.post('/install/datasource', (req, res)=>{
    co(function*() {
      let dbConf = req.body.db;
      let db = loopback.registry.createDataSource('db', dbConf);
      db.ping((err)=>{
        if(err) {
          return onError(err, res);
        }

        // 用 confirm 字段来区分 test 和 confirm 情况
        // conform 的情况下需要：
        
        var confirm = req.body.confirm;
        // 1.将配置写入 datasources.json 配置文件
        if(confirm) {
          let file = path.resolve(__dirname, '../datasources.json');
          jsonfile.writeFileSync(file, {db: dbConf}, {spaces: 2});
        }

        // 2.返回
        res.json({
          success: true
        });

        // 3.重启服务
        if(confirm) {
          return process.exit();
        }
      });
    }).catch(err=>{
      onError(err, res);
    });
  });

  router.get('/status', server.loopback.status());
};
