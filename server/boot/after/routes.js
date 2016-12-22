'use strict';

module.exports = (server)=>{
  let router = server.loopback.Router();

  router.get('/', (req, res)=>{
    res.render('index');
  });
  router.get('/status', server.loopback.status());

  server.use(router);
};
