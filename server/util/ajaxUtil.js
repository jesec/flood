'use strict';

let ajaxUtil = {
  getResponseFn: function (res) {
    return function (data, error) {
      if (error) {
        res.status(500).json(error);
        return;
      } else {
        res.json(data);
      }
    }
  }
};

module.exports = ajaxUtil;
