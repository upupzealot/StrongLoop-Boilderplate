;(function ($) {
  if(!$.fn.formFile) {
    var uploader_default_opt = {
      url: '/upload',
      name: 'file',
      multi_selection: false,
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

    var FileInput = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.input = opt.input;
      this.opt = _.merge({}, uploader_default_opt, {
        browse_button: this.$ele[0],
      });

      this.init();
      $ele.c(this);

      return $ele;
    };

    FileInput.prototype.init = function() {
      var self = this;

      self.input.init();
      self.$ele
        .on('change', function() {
          self.file = self.$ele.get(0).files[0];
        })
        .attr('readonly', true)
        .css('background-color', 'white');

      var opt = self.opt;
      var uploader = new plupload.Uploader(opt);
      uploader.init();
      uploader.bind('FilesAdded', function(uploader, files) {
        if(files.length) {
          if(files.length === 1) {
            self.$ele.val(files[0].name);
          } else {
            var text = files.map(function(file) {
              return file.name;
            }).join(', ');
            self.$ele.val(text);
          }
        } else {
          self.$else.val('');
        }
        uploader.splice(0, uploader.files.length - files.length);
        uploader.refresh();
        self.files = files;
      });
      uploader.bind('BeforeUpload',function(uploader, file) {
      });
      uploader.bind('UploadProgress',function(uploader, file) {
        opt.progress(file.percent);
      });
      uploader.bind('FileUploaded',function(uploader, file, responseObject) {
        var url = JSON.parse(responseObject.response).url;
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

    FileInput.prototype.upload = function(callback) {
      var self = this;
      self.uploader.start();
    }

    FileInput.prototype.validate = function() {
      return this.input.validate();
    }

    FileInput.prototype.val = function() {
      return this.file;
    }

    $.fn.formFile = function(opt) {
      var input = this.formInput(opt);
      opt.input = input.c();
      return new FileInput(this, opt);
    }
  }
})(jQuery);
