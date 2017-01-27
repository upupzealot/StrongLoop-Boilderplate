;(function ($) {
  if(!$['uploader-qiniu']) {
    var uploader_default_opt = {
      name: 'file',
      multi_selection: false,
      added: function (files) {},
      progress: function (percent) {},
      success: function (data) {},
      complete: function(files) {},
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
      opt.url = 'http://' + opt.uploadConf.endPoint;

      var uploader = this.pluploader = new plupload.Uploader(opt);
      uploader.init();

      self.urls = [];
      uploader.bind('FilesAdded', function(uploader, files) {
        uploader.splice(0, uploader.files.length - files.length);
        uploader.refresh();
        self.urls = [];

        if(opt.added) {
          opt.added(files);
        }
      });
      uploader.bind('BeforeUpload',function(uploader, file) {
        var params = _.merge({}, self.params, {
          key: self.params.path + '/' + self.params.uuid + '-' + file.name
        });
        uploader.settings.multipart_params = params;
      });
      uploader.bind('UploadProgress',function(uploader, file) {
        if(opt.progress) {
          opt.progress(file.percent);
        }
      });
      uploader.bind('FileUploaded',function(uploader, file, responseObject) {
        if(responseObject.status == 200) {
          var params = uploader.settings.multipart_params;
          var url = 'http://' + opt.uploadConf.host + '/' + params.key;
          self.urls.push(url);

          if(opt.success) {
            opt.success(url);
          }
        } else {
          if(opt.error) {
            opt.error(responseObject);
          }
        }
      });
      uploader.bind('UploadComplete',function(uploader, files) {
        if(opt.complete) {
          opt.complete(files);
        }
      });
      uploader.bind('Error',function(uploader, errObject) {
        if(opt.error) {
          opt.error(errObject);
        }
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
            'token': data.token,
          };
          self.params = params;
          self.uploader.start();
        }
      });
    }

    Uploader.prototype.val = function() {
      if(this.opt.multi_selection) {
        return this.urls;
      } else {
        return this.urls.length ? this.urls[0] : null;
      }
    }

    $.extend({
      'uploader-qiniu': Uploader
    });
  }
})(jQuery);
