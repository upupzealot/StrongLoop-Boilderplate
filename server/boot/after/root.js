'use strict';

module.exports = (server)=>{
  // Install a `/` route that returns server status
  let router = server.loopback.Router();
  //router.get('/', server.loopback.status());
  router.get('/', (req, res)=>{
    res.render('index');
  });
  server.use(router);
};
