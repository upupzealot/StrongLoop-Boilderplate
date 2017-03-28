;(function ($) {
  if(!$.fn.formInput) {
    var default_opt = {
      'type': 'text',
      valiTrigger: ['keyup', 'change'],
    };

    var Input = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.opt = $.extend({}, default_opt, opt);
      
      this.init();
      $ele.c(this);

      return $ele;
    };

    
    Input.prototype.init = function() {
      var self = this;
      var opt = self.opt;
      $['form-field']['vali-init'](self);
      if(self.$ele.prop('tagName').toLowerCase() === 'textarea') {
        autosize(self.$ele);
      }
    }

    Input.prototype.validate = function() {
      var valiResult = true;
      if(this.validator) {
        valiResult = this.validator.check.apply(null, [this.val()]);
      }
      $['form-field']['vali-show'](this, valiResult);
      return valiResult;
    }

    Input.prototype.val = function(value) {
      if(arguments.length) {
        return this.$ele.val(value);
      } else {
        return this.$ele.val();
      }
    }


    $.fn.formInput = function(opt) {
      return new Input(this, opt);
    }
  }
})(jQuery);
