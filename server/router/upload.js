'use strict';

const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const crypto = require('crypto');
const multiparty = require('connect-multiparty')();

const uploadConf = global.config.uploadConf;

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

  // alioss
  const ossConf = uploadConf.uploaders.alioss;
  router.get('/upload-token/alioss', (req, res)=>{
    let accessKeyId = ossConf.accessKeyID;
    let secretAccessKey = ossConf.accessKeySecret;
    let path = ossConf.rootPath.substr(1);//oss 不允许 '/' 开头作为key
    let key_uuid =  uuid.v4();
    let policy = '{"expiration":"2120-01-01T12:00:00.000Z",'
    + '"conditions":[{"bucket":"' + ossConf.bucket + '" },'
    + '["starts-with","$key","' + path + '/' + key_uuid + '-"]]}';

    let policyBase64 = new Buffer(policy).toString('base64');
    let signature = crypto.createHmac('sha1', secretAccessKey).update(policyBase64).digest().toString('base64');

    return res.json({
      path: path,
      uuid: key_uuid,
      policy: policyBase64,
      OSSAccessKeyId: accessKeyId,
      signature: signature
    });
  });

  // qiniu
  const qiniuConf = uploadConf.uploaders.qiniu;
  router.get('/upload-token/qiniu', (req, res)=>{
    let accessKeyId = qiniuConf.accessKeyID;
    let secretAccessKey = qiniuConf.accessKeySecret;
    let path = qiniuConf.rootPath.substr(1);//qiniu 不需要 '/' 开头作为key
    let policy = '{"scope": "' + qiniuConf.bucket + '",'
    + '"deadline":' + Math.floor(new Date('2120-01-01T12:00:00.000Z').valueOf() / 1000) + '}';

    let policyBase64 = new Buffer(policy).toString('base64');
    let signature = crypto.createHmac('sha1', secretAccessKey).update(policyBase64).digest().toString('base64');

    let token = accessKeyId + ':' + signature + ':' + policyBase64;

    return res.json({
      path: path,
      uuid: uuid.v4(),
      token: token
    });
  });

  // server
  let upload_server = (req, res, next)=>{
    let file = req.files.file;
    if(!file) {
      return next(new Error('上传的文件为空'));
    }

    try {
      //get filename
      let filename = file.originalFilename || path.basename(file.path);
      let key = '/upload/' + uuid.v4() + '-' + filename;

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
  router.post('/upload', multiparty, upload_server);
}
