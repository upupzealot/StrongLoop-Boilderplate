;(function ($) {
  $.fn.c = function(v) {
    if(typeof v === 'undefined') {
      return this.data('$c');
    } else {
      return this.data('$c', v);
    }
  }
})(jQuery);