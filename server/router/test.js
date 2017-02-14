'use strict';

module.exports = (router, server) => {
  router.get('/test/upload', (req, res) => {
    res.render('page/test/upload.ejs');
  });

  router.get('/test/rich-editor', (req, res) => {
    res.render('page/test/rich-editor.ejs');
  });
};
