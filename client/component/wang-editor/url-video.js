// video 菜单
(function (E, $) {

  E.createMenu(function (check) {
    var menuId = 'url-video';
    if (!check(menuId)) {
      return;
    }
    var editor = this;
    var lang = editor.config.lang;
    var reg = /^http(s)?:\/\//i;

    // 创建 menu 对象
    var menu = new E.Menu({
      editor: editor,
      id: menuId,
      title: lang.video,

      $domNormal: $('<a href="#" tabindex="-1"><i class="fa fa-play-circle"></i></a>'),
      $domSelected: $('<a href="#" tabindex="-1" class="selected"><i class="fa fa-play-circle"></i></a>'),
    });

    // 创建 panel 内容
    var $content = $('<div></div>');
    var $linkInputContainer = $('<div style="margin:20px 10px;"></div>');
    var $linkInput = $('<input type="text" class="block" placeholder="格式如：http://v.youku.com/v_show/id_XMzczMDM3MzE2.html"/>');
    $linkInputContainer.append($linkInput);
    var $btnContainer = $('<div></div>');
    var $howToCopy = $('<a href="http://www.kancloud.cn/wangfupeng/wangeditor2/134973" target="_blank" style="display:inline-block;margin-top:10px;margin-left:10px;color:#999;">如何复制视频链接？</a>');
    var $btnSubmit = $('<button class="right">' + lang.submit + '</button>');
    var $btnCancel = $('<button class="right gray">' + lang.cancel + '</button>');
    $btnContainer.append($howToCopy).append($btnSubmit).append($btnCancel);
    $content.append($linkInputContainer).append($btnContainer);

    // 取消按钮
    $btnCancel.click(function (e) {
      e.preventDefault();
      $linkInput.val('');
      menu.dropPanel.hide();
    });

    // 确定按钮
    $btnSubmit.click(function (e) {
      e.preventDefault();
      var link = $.trim($linkInput.val());

      // 验证数据
      if (!link) {
        menu.dropPanel.focusFirstInput();
        return;
      }

      if (!reg.test(link)) {
        alert('链接格式错误！');
        menu.dropPanel.focusFirstInput();
        return;
      }

      console.log(link)
      // 从后端接口取 embed 代码
      $.ajax({
        url: '/video-embed',
        type: 'POST',
        data: {
          url: link
        },
        success: function(data) {
          // 执行命令
          editor.command(e, 'insertHtml', data.embed);
          $linkInput.val('');
        },
        error: function(err) {
          console.log(err);
          alert(JSON.stringify(err));
        }
      });
    });

    // 创建panel
    menu.dropPanel = new E.DropPanel(editor, menu, {
      $content: $content,
      width: 400
    });

    // 增加到editor对象中
    editor.menus[menuId] = menu;
  });

})(wangEditor, jQuery);
