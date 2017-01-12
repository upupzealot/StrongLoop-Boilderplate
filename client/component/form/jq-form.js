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
      'combobox': 'formCombobox'
    };
    Form.prototype.init = function() {
      var self = this;
      var opt = self.opt;

      self.filedComponents = {};
      opt.fields.map(function(field) {
        var name = field.opt.name;
        var $field = self.$ele.find('[name=' + name + ']');

        var fieldClass = fieldClasses[field.type];
        $field[fieldClass](field.opt);
        self.filedComponents[name] = $field.c();
      });
    }

    Form.prototype.val = function() {
      var form = {};
      for(var name in this.filedComponents) {
        form[name] = this.filedComponents[name].val();
      }
      return form;
    }

    Form.prototype.validate = function() {
      var self = this;
      var result = true;
      for(var k in self.filedComponents) {
        var component = self.filedComponents[k];
        result = component.validate() === true && result;
      }
      return result;
    }
    

    $.fn.form = function(opt) {
      return new Form(this, opt);
    }
  }
})(jQuery);