'use strict';

let ajaxUtil = {
  getResponseFn: (res) => {
    return (data, error) => {
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
