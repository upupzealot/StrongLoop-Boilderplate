'use strict';

module.exports = (router, server) => {
  router.get('/', (req, res) => {
    res.render('page/index.ejs');
  });
};
