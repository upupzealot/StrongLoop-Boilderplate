'use strict';

module.exports = (router, server) => {
  router.get('/register', (req, res) => {
    res.render('page/user/register.ejs');
  });

  router.get('/login', (req, res) => {
    res.render('page/user/login.ejs');
  });
};
