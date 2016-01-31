'use strict';

let ajaxUtil = {
  getResponseFn: function (res) {
    return function (error, response) {
      if (error) {
        console.log('error in getResponseFn', error);
      }
      res.json(response);
    }
  }
};

module.exports = ajaxUtil;
