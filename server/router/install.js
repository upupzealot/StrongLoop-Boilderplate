'use strict';

const path = require('path');
const jsonfile = require('jsonfile');
const loopback = require('loopback');
const co = require('co');
const Promise = require('bluebird');

module.exports = (router, server)=>{
  router.get('/install/admin', (req, res)=>{
    res.render('page/install/admin');
  });
  router.post('/install/admin', (req, res)=>{
    var file = path.resolve(__dirname, '../config/admin.json');
    jsonfile.writeFileSync(file, req.body, {spaces: 2});
    res.json({success: true});
  });

  router.get('/install/datasource', (req, res)=>{
    res.render('page/install/datasource');
  });

  let onError = (err, res)=>{
    res.status(500);
    res.json({
      success: false,
      msg: err.toString(),
    });
  }
  router.post('/install/datasource', (req, res)=>{
    co(function*() {
      var dbConf = req.body.db;
      var db = loopback.registry.createDataSource('db', dbConf);
      db.ping((err)=>{
        if(err) {
          return onError(err, res);
        }

        if(req.body.confirm) {
          var file = path.resolve(__dirname, '../datasource.json');
          jsonfile.writeFileSync(file, {db: dbConf}, {spaces: 2});
        }

        return res.json({
          success: true
        });
      });
    }).catch(err=>{
      onError(err, res);
    });
  });

  router.get('/status', server.loopback.status());
};
