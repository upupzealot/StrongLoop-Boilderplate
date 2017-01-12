;(function ($) {
  if(!$.fn.getValidator) {
    var defaultValidators = {
      username: function(){
        this.check = ['notEmpty', /[\u4e00-\u9fa5_a-zA-Z0-9_-]+/];
        this.msg = '用户名必须由 中英日韩、数字、下划线、中划线构成';
      },
      notEmpty: function(){
        this.check = function(value) {
          return value.length > 0;
        };
        this.msg = '不能为空';
      },
      number: function(){
        this.check = ['notEmpty', function(value) {
          return !isNaN(value);
        }];
        this.msg = '必须是数字';
      },
      integer: function(){
        this.check = ['number', function(value) {
          return !isNaN(value) && _.isInteger(parseFloat(value));
        }];
        this.msg = '必须是整数';
      },
      numberLimit: function(floor, ceil) {
        var self = this;
        self.floor = floor;
        self.ceil = ceil;

        this.check = ['number', function(value) {
          var floor = parseFloat(self.floor.slice(1));
          var ceil = parseFloat(self.ceil.slice(0, -1));
          var gt = self.floor.slice(0, 1) === '[' ?
                   value >= floor :
                   value > floor;
          var lt = self.ceil.slice(-1) === ']' ?
                   value <= ceil :
                   value < ceil;
          return gt && lt ? true : self.msg;
        }];
        this.msg = '超出允许的数值范围' + floor + ' ,' + ceil;
      }
    }

    function getValidator(opt) {
      var check = null;
      var msg = null;
      if(_.isObject(opt) && !_.isArray(opt) && !_.isRegExp(opt) && !_.isFunction(opt)) {
        check = opt.check;
        msg = opt.msg;
      } else {

        check = opt;
      }

      if(_.isArray(check)) {
        return {
          check: function(value) {
            return fromArray(check)(value);
          }
        }
      }

      check = parseRegExp(check);
      if(_.isRegExp(check)) {
        return {
          check: function(value) {
            var result = fromRegExp(check)(value);
            return result === true 
                   ? true
                   : _.isString(result) ? result : msg;
          }
        }
      };

      check = parseFunction(check);
      if(_.isFunction(check)) {
        return {
          check: function(value) {
            var result = check(value);
            return result === true
                   ? true
                   : _.isString(result) ? result : msg;
          }
        };
      };

      var args = [];
      // check 为字符时，去 defaultValidators 中找对应
      if(_.isString(check)) {
        var defaultVali = check;
        // 校验器带参
        if(check.indexOf('(') > 0) {
          var start = check.indexOf('(');
          var end = check.lastIndexOf(')');

          defaultVali = check.slice(0, start);
          //check = splits[0];
          var args = args.concat(
              check.slice(check.indexOf('(') + 1, check.lastIndexOf(')'))
              .split(',')
              .map(function(arg) {
                arg = _.trim(arg);
                try {
                  arg = JSON.parse(arg);
                }catch(e){};
                return arg;
              }));
        }
        defaultVali = defaultValidators[defaultVali];
        var constructor = function(clazz) {
          var wrapper = function(args) {
            clazz.apply(this, args);
          };
          wrapper.prototype = clazz.prototype;
          return wrapper;
        };
        var vali = new (new constructor(defaultVali))(args);
        vali.validator = getValidator(vali);
        return {
          check: function(value) {
            var result = vali.validator.check.apply(null, [value].concat(args));
            return result === true
                   ? true
                   : _.isString(result) ? result : vali.msg;
          }
        }
      }
    }



    function fromArray(opts) {
      var validators = opts.map(function(o) {
        return getValidator(o);
      });
      return function arrayCheck(value) {
        var result = true;
        for(var i = 0; i < validators.length; i++) {
          result = result && validators[i].check(value);
          if(result !== true) {
            break;
          }
        }
        return result;
      }
    }

    // check 若为正则，转化为正则
    function parseRegExp(check) {
      if(_.isString(check)
        && check.length > 2
        && _.startsWith(check, '/')
        && _.endsWith(check, '/')) {
        try{
          var v = new RegExp(check.slice(1, -1));
          // 参考: http://stackoverflow.com/questions/12257703/jquery-convert-string-to-reg-exp-object
          if(_.isRegExp(v)) {
            check = v;
          }
        }catch(e){};
      }
      return check;
    }
    // 正则作为校验器时，转为响应的函数
    function fromRegExp(check) {
      return function(value) {
        return check.test(value) && value.replace(check, '1') === '1';
      };
    }

    // check 若为函数，转化为函数
    function parseFunction(check) {
      if(_.isString(check)) {
        try{
          var v = eval("(function(){return " + check + " })()");
          if(_.isFunction(v)) {
            check = v;
          }
        }catch(e){};
      }
      return check;
    }

    $.extend({
      getValidator: getValidator,
    });
  }
})(jQuery);