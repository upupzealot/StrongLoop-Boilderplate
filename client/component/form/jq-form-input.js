;(function ($) {
  if(!$.fn.formInput) {
    var default_opt = {
      'type': 'text',
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

      self.$group = self.$ele.closest('.form-group');
      self.$helpBlock = self.$group.find('.help-block');
      if(opt.vali) {
        self.validator = $.getValidator(opt.vali, self);
        if(!self.validator) {
          console ? console.warn('validator undefined for field: ' + self.opt.name): null;
        }
        if(!self.$helpBlock.length) {
          self.$group.append('<p class="help-block"></p>');
          self.$helpBlock = self.$group.find('.help-block');
        }

        self.$ele.on('keyup', function() {
          self.validate();
        });
      }
    }

    Input.prototype.validate = function() {
      if(!this.validator) {
        return true;
      }
      
      var valiResult = this.validator.check.apply(null, [this.val()]);
      if(valiResult !== true) {
        this.$group.addClass('has-error');
        this.$helpBlock.html(valiResult).show();
      } else {
        this.$group.removeClass('has-error');
        this.$helpBlock.hide();
      }
      return valiResult;
    }

    Input.prototype.val = function() {
      return this.$ele.val();
    }


    $.fn.formInput = function(opt) {
      return new Input(this, opt);
    }
  }
})(jQuery);
