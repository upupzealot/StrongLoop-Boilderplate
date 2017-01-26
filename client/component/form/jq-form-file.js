;(function ($) {
  if(!$.fn.formFile) {

    var FileInput = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.opt = _.merge({}, opt);
      this.input = opt.input;

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
          } else {
            self.$else.val('');
          }
        }
      }, {uploadConf: $.uploadConf}, self.opt);

      self.uploader = new $['uploader-' + opt.uploadConf.default](opt);
    }

    FileInput.prototype.upload = function(callback) {
      this.uploader.upload();
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