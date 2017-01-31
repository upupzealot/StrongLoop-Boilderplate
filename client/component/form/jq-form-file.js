;(function ($) {
  if(!$.fn.formFile) {

    var FileInput = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.opt = _.merge({
        valiTrigger: ['change'],
      }, opt);
      this.input = $ele.formInput(this.opt).c();

      this.init();
      $ele.c(this);

      return $ele;
    };

    FileInput.prototype.init = function() {
      var self = this;
      var opt = self.opt;
      var WaitToUpload = '[warning:]等待上传'
      opt.vali = [opt.vali, {
        check: function(value) {
          var queue = self.uploader.pluploader.files;
          var urls = self.uploader.urls;
          return queue.length > 0 && queue.length === urls.length;
        },
        msg: WaitToUpload,
      }];
      $['form-field']['vali-init'](self);

      self.$ele
        .on('change', function() {
          self.file = self.$ele.get(0).files[0];
        })
        .attr('readonly', true)
        .css('background-color', 'white');

      var $progress = self.$ele.next('.progress');
      var $progressbar = $progress.find('.progress-bar');
      var $upload_btn = self.$ele
        .closest('.form-group')
        .find('.input-group-btn .btn');
      $upload_btn.on('click', function() {
        var validation = self.validate();
        if(validation !== true && validation !== WaitToUpload) {
          return;
        }

        self.upload();
      });

      var opt = _.merge({}, {
        browse_button: self.$ele[0],
        added: function(files) {
          if(files.length) {
            if(files.length === 1) {
              self.$ele.val(files[0].name);
            } else {
              var text = files.map(function(file) {
                return file.name;
              }).join(', ');
              self.$ele.val(text);
            }
            $progressbar.css('width', 0);
            $upload_btn
              .attr('disabled', false)
              .text('上传');
          } else {
            self.$else.val('');
            $upload_btn
              .attr('disabled', true)
              .text('上传');;
          }
          self.validate();
        },
        progress: function(percent) {
          $progressbar.css('width', percent + '%');
        },
        complete: function(files) {
          $upload_btn
            .attr('disabled', true)
            .text('完成');
          self.validate();
        },
      }, {uploadConf: $.uploadConf}, self.opt);

      self.uploader = new $['uploader-' + opt.uploadConf.default](opt);
    }

    FileInput.prototype.upload = function(callback) {
      this.uploader.upload();
    }

    FileInput.prototype.validate = function() {
      var valiResult = true;
      if(this.validator) {
        valiResult = this.validator.check.apply(null, [this.uploader.pluploader.files]);
      }
      $['form-field']['vali-show'](this, valiResult);
      return valiResult;
    }

    FileInput.prototype.val = function() {
      return this.uploader.val();
    }

    $.fn.formFile = function(opt) {
      return new FileInput(this, opt);
    }
  }
})(jQuery);
