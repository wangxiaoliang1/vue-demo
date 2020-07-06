/* eslint-disable */
import $ from "./jquery.min.js";
import {Modal} from "view-design";

export const utility = {
  // 创建一个GUID
  newGuid: function () {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
      var n = Math.floor(Math.random() * 16.0).toString(16);
      guid += n;
      if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) guid += "-";
    }
    return guid;
  },
  // 获取iframe窗口
  iframe: function (Id, _frames) {
    if (_frames[Id] != undefined) {
      if (_frames[Id].contentWindow != undefined) {
        return _frames[Id].contentWindow;
      } else {
        return _frames[Id];
      }
    } else {
      return null;
    }
  },
  // 提示消息栏
  alert: {
    success: function (msg) {
      Modal.success({title: msg})
    },
    info: function (msg) {
      Modal.info({title: msg})
    },
    warning: function (msg) {
      Modal.warning({title: msg})
    },
    error: function (msg) {
      Modal.error({title: msg})
    }
  },
  //下载文件（she写的扩展）
  download: function (options) {
    var defaults = {
      method: "GET",
      url: "",
      param: []
    };
    var options = $.extend(defaults, options);
    if (options.url && options.param) {
      var $form = $('<form action="' + options.url + '" method="' + (options.method || 'post') + '"></form>');
      for (var key in options.param) {
        var $input = $('<input type="hidden" />').attr('name', key).val(options.param[key]);
        $form.append($input);
      }
      $form.appendTo('body').submit().remove();
    }
  },
};
