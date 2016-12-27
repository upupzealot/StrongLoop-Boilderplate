'use strict';

const path = require('path');
const jsonfile = require('jsonfile');

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
  router.post('/install/datasource', (req, res)=>{
    var file = path.resolve(__dirname, '../datasources.json');
    var datasources = jsonfile.readFileSync(file);
    console.log(datasources.db.connector);
    res.json({success: true});
    //res.status(404).send('hehe');
  });

  router.get('/status', server.loopback.status());
};
