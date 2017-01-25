'use strict';

const fs = require('fs');
const path = require('path');
const multiparty = require('connect-multiparty')();

// 调用失败时的返回错误信息
let onError = (err, res)=>{
  res.status(500);
  res.json({
    success: false,
    msg: err.toString(),
  });
}

module.exports = (router, server)=>{
  router.get('/test/upload', (req, res)=>{
    res.render('page/test/upload.ejs');
  });

  /*
   *  savePath: 基于 /client 的路径
   */
  let upload_endpoint = (req, res, next)=>{
    let file = req.files.file;
    if(!file) {
      return next(new Error('上传的文件为空'));
    }

    try {
      //get filename
      let filename = file.originalFilename || path.basename(file.path);
      let key = '/upload/' + filename;
      //copy file to a public directory
      let targetPath = path.resolve(__dirname, '../../client');
      targetPath += '/' + key;
      let dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      fs.rename(
        file.path,
        targetPath,
        (err)=>{
          if(err) {
            fs.unlink(file.path);
            return next(err);
          }

          let url = key;
          req.uploadedFile = key;
          return res.json({url: key});
        }
      );
    } catch(e) {
      fs.unlink(file.path);
      throw e;
    }
  }

  router.post('/upload', multiparty, upload_endpoint);
}
