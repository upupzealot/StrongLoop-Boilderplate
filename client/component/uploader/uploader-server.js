;(function ($) {
  if(!$['uploader-server']) {
    var uploader_default_opt = {
      url: '/upload',
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
      });
      uploader.bind('UploadProgress',function(uploader, file) {
        opt.progress(file.percent);
      });
      uploader.bind('FileUploaded',function(uploader, file, responseObject) {
        var url = JSON.parse(responseObject.response).url;
        self.urls.push(url);

        opt.success(url);
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
      self.uploader.start();
    }

    Uploader.prototype.val = function() {
      if(this.opt.multi_selection) {
        return this.urls;
      } else {
        return this.urls.length ? this.urls[0] : null;
      }
    }

    $.extend({
      'uploader-server': Uploader
    });
  }
})(jQuery);
