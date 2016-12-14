'use strict';

const datasources = require('../datasources.json');

module.exports = (server)=>{
  // Install a `/` route that returns server status
  let router = server.loopback.Router();
  //router.get('/', server.loopback.status());
  router.get('/', (req, res)=>{
    res.render('index', {
      code: JSON.stringify(datasources, null, 2)
    });
  });
  server.use(router);
};
