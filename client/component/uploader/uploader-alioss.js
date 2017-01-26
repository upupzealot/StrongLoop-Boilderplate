;(function ($) {
  if(!$['uploader-alioss']) {
    var uploader_default_opt = {
      name: 'file',
      multi_selection: false,
      added: function (files) {
        console.log(files);
      },
      progress: function (percent) {
        //console.log(percent);
      },
      success: function (data) {
        console.log(data + ' uploaded!');
      },
      complete: function(files) {
        console.log('complete ' + files.length + ' files!');
      },
      error: function (err) {
        console.log('upload error:');
        console.log(err);
        alert(JSON.stringify(err));
      },
    }

    var Uploader = function(opt) {
      this.opt = _.merge({}, uploader_default_opt, opt);

      this.init();
      return this;
    };

    Uploader.prototype.init = function() {
      var self = this;

      var opt = self.opt;
      opt.url = 'http://' + opt.uploadConf.bucket + '.' + opt.uploadConf.endPoint;

      var uploader = this.pluploader = new plupload.Uploader(opt);
      uploader.init();

      uploader.bind('FilesAdded', function(uploader, files) {
        uploader.splice(0, uploader.files.length - files.length);
        uploader.refresh();
        self.files = files;

        opt.added(files);
      });
      uploader.bind('BeforeUpload',function(uploader, file) {
        var params = _.merge({}, self.params, {
          key: self.params.path + '/' + self.params.uuid + '-' + file.name
        });
        uploader.settings.multipart_params = params;
      });
      uploader.bind('UploadProgress',function(uploader, file) {
        opt.progress(file.percent);
      });
      uploader.bind('FileUploaded',function(uploader, file, responseObject) {
        if(responseObject.status == 200) {
          var params = uploader.settings.multipart_params;
          var url = opt.url + '/' + params.key;
          opt.success(url);
        } else {
          opt.error(responseObject);
        }
      });
      uploader.bind('UploadComplete',function(uploader, files) {
        opt.complete(files);
      });
      uploader.bind('Error',function(uploader, errObject) {
        opt.error(errObject);
      });
      self.uploader = uploader;
    }

    Uploader.prototype.upload = function(callback) {
      var self = this;
      $.ajax({
        url: self.opt.uploadConf.tokenUrl,
        type: 'GET',
        success: function(data) {
          var params = {
            'path': data.path,
            'uuid': data.uuid,
            'policy': data.policy,
            'OSSAccessKeyId': data.OSSAccessKeyId,
            'success_action_status' : '200',
            'signature': data.signature,
          };
          self.params = params;
          self.uploader.start();
        }
      });
    }

    Uploader.prototype.val = function() {
      return this.file;
    }

    $.extend({
      'uploader-alioss': Uploader
    });
  }
})(jQuery);
