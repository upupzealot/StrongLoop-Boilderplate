$(function() {
  var $modal = $('#alert-modal');

  var $header = $modal.find('.modal-header');
  var $title = $header.find('.modal-title');
  var $body = $modal.find('.modal-body');
  var $cancleBtn = $modal.find('.modal-footer .btn-default');
  var $confirmBtn = $modal.find('.modal-footer .btn-primary');

  $.extend({
    modal: function(opt) {
      if(opt.title) {
        $title.text(opt.title);
      } else {
        $header.hide();
      }

      if(opt.body) {
        $body.html(opt.body);
      }

      if(opt.onConfirm) {
        $confirmBtn.unbind('click');
        $confirmBtn.one('click', function() {
          $modal.one('hidden.bs.modal', opt.onConfirm)
          $modal.modal('hide');
        });
      } else {
        $confirmBtn.one('click', function() {
          $modal.modal('hide');
        });
      }

      if(opt.onCancle) {
        $cancleBtn.unbind('click');
        $cancleBtn.one('click', opt.onCancle);
      }

      $modal.modal('show');
    }
  });
});
