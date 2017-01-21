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
      'file': 'formFile',
      'combobox': 'formCombobox'
    };
    Form.prototype.init = function() {
      var self = this;
      var opt = self.opt;

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
})(jQuery);
