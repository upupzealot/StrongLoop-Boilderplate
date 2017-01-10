;(function ($) {
  if(!$.fn.formInput) {
    var default_opt = {
      'type': 'text',
    };

    var defaultValidators = {
      username: function(){
        this.validator = /[\u4e00-\u9fa5_a-zA-Z0-9_-]+/;
        this.msg = '用户名必须由 中英日韩、数字、下划线、中划线构成';
      },
      notEmpty: function(){
        this.validator = function(value) {
          return value.length > 0;
        };
        this.msg = '不能为空';
      },
      number: function(){
        this.validator = function(value) {
          return !isNaN(value);
        };
        this.msg = '必须是数字';
      },
      integer: function(){
        this.validator = function(value) {
          return !isNaN(value) && _.isInteger(parseFloat(value));
        };
        this.msg = '必须是整数';
      },
      numberLimit: function(){
        this.validator = function(value, floor, ceil) {
          
        };
        this.msg = '不能为空';
      }
    }

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
      if(opt.vali) {
        self.validator = $.getValidator(opt.vali);
        self.$ele.on('keyup', function() {
          var valiResult = self.validate();
          if(valiResult !== true) {
            $group.addClass('has-error');
            console.log(valiResult);
          } else {
            $group.removeClass('has-error');
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