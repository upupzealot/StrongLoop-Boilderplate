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
        self.validator = getValidator(opt.vali);
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

    function getValidator(opt) {
      if(opt && opt.rule && _.isArray(opt.rule)) {
        var validators = opt.rule.map(function(o) {
          return getValidator(o);
        });

        return function(value) {
          for(var i = 0; i < validators.length; i++) {
            var result = true;
            result = result && validators[i](value);

            if(result !== true) {
              return result;
            }
          }
          return result;
        }
      }

      var rule = null;
      var msg = null;
      if(_.isObject(opt)) {
        rule = opt.rule;
        msg = opt.msg;
      } else {
        rule = opt;
      }
      var validator = null;
      var args = [];

      // 若为正则，转化为正则
      if(_.isString(rule)
        && rule.length > 2
        && _.startsWith(rule, '/')
        && _.endsWith(rule, '/')) {
        try{
          var v = new RegExp(rule.slice(1, -1));
          // 参考: http://stackoverflow.com/questions/12257703/jquery-convert-string-to-reg-exp-object
          if(_.isRegExp(v)) {
            rule = v;
          }
        }catch(e){};
      }
      // 正则作为校验器时，转为响应的函数
      function convertRegExp(rule) {
        if(_.isRegExp(rule)) {
          return function(value) {
            return rule.test(value) && value.replace(rule, '1') === '1';
          };
        }
        return rule;
      }
      validator = convertRegExp(rule);

      // 若为函数，转化为函数
      if(_.isString(rule)) {
        try{
          var v = eval("(function(){return " + rule + " })()");
          if(_.isFunction(v)) {
            rule = v;
            validator = v;
          }
        }catch(e){};
      }

      // 字符串作为校验器时，去 defaultValidators 中找对应
      if(_.isString(rule)) {
        // 校验器带参
        if(rule.indexOf('(') > 0) {
          var splits = rule.split(/\(|\)/);
          rule = splits[0];
          args = args.concat(
            splits[1]
              .split(',')
              .map(function(arg) {
                arg = _.trim(arg);
                try {
                  arg = JSON.parse(arg);
                }catch(e){};
                return arg;
              }));
        }
        var defaultVali = defaultValidators[rule];
        if(_.isFunction(defaultVali)) {
          defaultVali = new defaultVali();
        }
        validator = convertRegExp(defaultVali.validator);
        msg = opt.msg || defaultVali.msg;
      }

      return function(value) {
        return validator.apply(null, [value].concat(args)) ? true : msg;
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