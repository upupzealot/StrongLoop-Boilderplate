;(function ($) {
  if(!$.fn.formCombobox) {
    var default_opt = {
      'type': 'text',
    };

    var Combobox = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.opt = $.extend({}, default_opt, opt);
      
      this.init();
      $ele.c(this);

      return $ele;
    };

    
    Combobox.prototype.init = function() {
      var self = this;
      var opt = self.opt;
      var $ele = self.$ele;

      $ele.selectpicker({
        width: '100%'
      });
      var selecting = $ele.val();

      var linkageHelp = opt.linkages && opt.linkages.help;
      if(linkageHelp) {
        self.$helpBlock = $ele.closest('.form-group').find('.help-block');
      }

      var linkageForm = opt.linkages && opt.linkages.form;
      if(linkageForm) {
        self.$forms = {};
        opt.options.map(function(option) {
          self.$forms[option] = $('#' + linkageForm[option] || '');
        });
      }

      $ele.on('change', function() {
        if(linkageHelp) {
          self.$helpBlock.html(linkageHelp[$ele.val()] || '');
        }

        if(linkageForm) {
          self.$forms[selecting].hide();
          self.$forms[$ele.val()].show();
        }
        selecting = $ele.val();
      });
    }

    Combobox.prototype.val = function() {
      var opt = this.opt;
      var $ele = this.$ele;

      var linkageForm = opt.linkages && opt.linkages.form;
      var selecting = $ele.val();
      var value = null;
      if(linkageForm) {
        value = linkageForm[selecting] ? this.$forms[selecting].c().val() : {};
        value[opt.linkages.rootName] = $ele.val();
      } else {
        value = $ele.val();
      }
      return value;
    }

    Combobox.prototype.validate = function() {
      if(this.$forms) {
        var form = this.$forms[this.$ele.val()].c();
        return form ? form.validate() : true;
      } else {
        return true;
      }
    }


    $.fn.formCombobox = function(opt) {
      return new Combobox(this, opt);
    }
  }
})(jQuery);
