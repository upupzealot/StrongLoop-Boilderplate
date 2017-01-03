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
      self.$ele.on('keyup', function() {
        if(!self.validate(opt.vali)) {
          $group.addClass('has-error');
        } else {
          $group.removeClass('has-error');
        }
      });
    }

    Input.defaultValidators = {
      username: {
        vali: function(value, name) {
          return value == name;
        },
        msg: 'msg'
      },
    }
    Input.prototype.validate = function(vali) {
      var validator = null;
      var args = [this.val()];

      try{
        var v = new RegExp(vali.slice(1, -1));
        // 参考: http://stackoverflow.com/questions/12257703/jquery-convert-string-to-reg-exp-object
        if(_.isRegExp(v)) {
          vali = v;
        }
      }catch(e){};

      if(_.isRegExp(vali)) {
        validator = function(value) {
          return vali.test(value);
        };
      }
      if(_.isString(vali)) {
        if(vali.indexOf('(') > 0) {
          var splits = vali.split(/\(|\)/);
          validator = Input.defaultValidators[splits[0]].vali;
          args = args.concat(
            splits[1]
              .split(',')
              .map(function(arg) {
                arg = _.trim(arg);
                return JSON.parse(arg);
              }));
        } else {
          validator = Input.defaultValidators[vali];
        }
      }
      return validator.apply(null, args);
    }

    Input.prototype.val = function() {
      return this.$ele.val();
    }


    $.fn.formInput = function(opt) {
      return new Input(this, opt);
    }
  }
})(jQuery);