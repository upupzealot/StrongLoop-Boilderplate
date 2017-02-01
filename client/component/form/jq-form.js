;(function ($) {
  if(!$.fn.form) {
    var default_opt = {};

    var Form = function(ele, opt) {
      var $ele = this.$ele = ele;
      this.opt = $.extend({}, default_opt, opt);
      
      this.init();
      $ele.c(this);

      return $ele;
    };

    
    // 组件类型到 jq 插件名的映射
    var fieldClasses = {
      'input': 'formInput',
      'file': 'formInputFile',
      'combobox': 'formCombobox',
    };
    Form.prototype.init = function() {
      var self = this;
      var opt = self.opt;
      $['form-field']['vali-init'](self);

      self.fieldComponents = {};
      opt.fields.map(function(field) {
        var name = field.opt.name;
        var $field = self.$ele.find('[name=' + name + ']');

        var fieldClass = fieldClasses[field.type];
        var component = $field[fieldClass](field.opt).c();
        component.form = self;
        self.fieldComponents[name] = component;
      });
    }

    Form.prototype.val = function() {
      var form = {};
      for(var name in this.fieldComponents) {
        form[name] = this.fieldComponents[name].val();
      }
      return form;
    }

    Form.prototype.validate = function() {
      var self = this;
      var result = true;
      for(var k in self.fieldComponents) {
        var component = self.fieldComponents[k];
        result = component.validate() === true && result;
      }
      return result;
    }


    $.fn.form = function(opt) {
      return new Form(this, opt);
    }
  }

  if(!$['form-field']) {
    $.extend({
      'form-field': {
        'vali-init': function(instance) {
          var self = instance;
          var opt = instance.opt;

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

            var triggers = opt.valiTrigger || ['change'];
            triggers.map(function(trigger) {
              self.$ele.on(trigger, function() {
                self.validate();
              });
            });
          }
        },
        'vali-show': function(instance, result) {
          var self = instance;

          if(result !== true) {
            var type = 'has-error';
            if(_.startsWith(result,'[warning:]')) {
              type = 'has-warning';
              result = result.substr('[warning:]'.length);
            }
            self.$group.removeClass('has-warning has-error').addClass(type);
            self.$helpBlock.html(result).show();
          } else {
            self.$group.removeClass('has-warning has-error');
            self.$helpBlock.hide();
          }
          return result;
        },
      },
    });
  }
})(jQuery);
