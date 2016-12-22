'use strict';

module.exports = (router, server)=>{
  router.get('/', (req, res)=>{
    res.render('index');
  });
  router.get('/status', server.loopback.status());
};
