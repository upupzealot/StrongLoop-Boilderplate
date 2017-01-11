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

      var $group = self.$group = self.$ele.parent('.form-group');
      var $helpBlock = $group.find('.help-block');
      if(opt.vali) {
        self.validator = $.getValidator(opt.vali).check;
        if(!$helpBlock.length) {
          $group.append('<p class="help-block"></p>');
          $helpBlock = $group.find('.help-block');
        }

        self.$ele.on('keyup', function() {
          var valiResult = self.validate();
          if(valiResult !== true) {
            $group.addClass('has-error');
            $helpBlock.html(valiResult).show();
            console.log('Error: ' + valiResult);
          } else {
            $group.removeClass('has-error');
            $helpBlock.hide();
          }
        });
      }
    }

    Input.prototype.validate = function() {
      return this.validator.apply(null, [this.val()]);
    }

    Input.prototype.val = function() {
      return this.$ele.val();
    }


    $.fn.formInput = function(opt) {
      return new Input(this, opt);
    }
  }
})(jQuery);