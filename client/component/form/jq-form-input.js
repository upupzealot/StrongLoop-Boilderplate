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

      self.$group = self.$ele.parent('.form-group');
      self.$helpBlock = self.$group.find('.help-block');
      if(opt.vali) {
        self.validator = $.getValidator(opt.vali).check;
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
      var valiResult = this.validator.apply(null, [this.val()]);
      if(valiResult !== true) {
        this.$group.addClass('has-error');
        this.$helpBlock.html(valiResult).show();
        console.log('Error: ' + valiResult);
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