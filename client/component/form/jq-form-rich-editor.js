;(function ($) {
  if(!$.fn.formRichEditor) {
    var default_opt = {
      'type': 'text',
      valiTrigger: ['keyup', 'change'],
    };

    var RichEditor = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.opt = $.extend({}, default_opt, opt);
      
      this.init();
      $ele.c(this);

      return $ele;
    };

    
    RichEditor.prototype.init = function() {
      var self = this;
      var opt = self.opt;
      $['form-field']['vali-init'](self);

      var editor = self.wangEditor = new wangEditor(self.$ele[0]);

      editor.config.customUpload = true;
      editor.config.customUploadInit = self.uploadInit;

      editor.config.menus = [
        'bold',
        '|',
        'link',
        'img',
        //'video',
        'url-video',
        'insertcode',
        '|','source'
      ];
      editor.create();
    }

    RichEditor.prototype.uploadInit = function() {
      var editor = this;
      var btnId = editor.customUploadBtnId;
      var urls = [];

      var uploader = new $['uploader-' + $.uploadConf.default]({
        browse_button: btnId,
        multi_selection: true,
        added: function (_uploader, files) {
          uploader.upload();
        },
        progress: function (percent) {
          editor.showUploadProgress(percent);
        },
        success: function (url) {
          urls.push(url);
        },
        complete: function (files) {
          try {
            $.each(urls, function (index, value) {
              editor.command(null, 'insertHtml', '<img src="' + value + '" style="max-width:100%;"/>');
            });
          } catch (ex) {
          } finally {
            urls = [];
            editor.hideUploadProgress();
          }
        }
      });
    }

    RichEditor.prototype.validate = function() {
      var valiResult = true;
      if(this.validator) {
        valiResult = this.validator.check.apply(null, [this.val()]);
      }
      $['form-field']['vali-show'](this, valiResult);
      return valiResult;
    }

    RichEditor.prototype.val = function() {
      return this.wangEditor.$txt.html()
        .replace(/\s+$/, '').replace(/<p><br><\/p>$/, '');
    }


    $.fn.formRichEditor = function(opt) {
      return new RichEditor(this, opt);
    }
  }
})(jQuery);
