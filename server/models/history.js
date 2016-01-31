'use strict';
var Datastore = require('nedb');

var client = require('./client');
var config = require('../../config');
var HistoryEra = require('./HistoryEra');

let pollInterval = null;

let yearSnapshot = new HistoryEra({
  interval: 1000 * 60 * 60 * 24 * 7, // 7 days
  name: 'yearSnapshot',
  maxTime: 0 // 365 days
});

let monthSnapshot = new HistoryEra({
  interval: 1000 * 60 * 60 * 12, // 12 hours
  maxTime: 1000 * 60 * 60 * 24 * 365, // 365 days
  name: 'monthSnapshot',
  nextEraUpdateInterval: 1000 * 60 * 60 * 24 * 7, // 7 days
  nextEra: yearSnapshot
});

let weekSnapshot = new HistoryEra({
  interval: 1000 * 60 * 60 * 4, // 4 hours
  maxTime: 1000 * 60 * 60 * 24 * 7 * 24, // 24 weeks
  name: 'weekSnapshot',
  nextEraUpdateInterval: 1000 * 60 * 60 * 12, // 12 hours
  nextEra: monthSnapshot
});

let daySnapshot = new HistoryEra({
  interval: 1000 * 60 * 60, // 60 minutes
  maxTime: 1000 * 60 * 60 * 24 * 30, // 30 days
  name: 'daySnapshot',
  nextEraUpdateInterval: 1000 * 60 * 60 * 4, // 4 hours
  nextEra: weekSnapshot
});

let hourSnapshot = new HistoryEra({
  interval: 1000 * 60 * 15, // 15 minutes
  maxTime: 1000 * 60 * 60 * 24, // 24 hours
  name: 'hourSnapshot',
  nextEraUpdateInterval: 1000 * 60 * 60, // 60 minutes
  nextEra: daySnapshot
});

let thirtyMinSnapshot = new HistoryEra({
  interval: 1000 * 20, // 20 seconds
  maxTime: 1000 * 60 * 30, // 30 minutes
  name: 'thirtyMinSnapshot',
  nextEraUpdateInterval: 1000 * 60 * 15, // 15 minutes
  nextEra: hourSnapshot
});

let fiveMinSnapshot = new HistoryEra({
  interval: 1000 * 5, // 5 seconds
  maxTime: 1000 * 60 * 5, // 5 minutes
  name: 'fiveMinSnapshot',
  nextEraUpdateInterval: 1000 * 20, // 20 seconds
  nextEra: thirtyMinSnapshot
});

let processData = function (opts, callback, error, data) {
  if (error) {
    callback(error);
  }

  data = data.slice(data.length - config.maxHistoryStates);

  let downloadRateHistory = [];
  let uploadRateHistory = [];

  data.forEach(function (snapshot) {
    downloadRateHistory.push(snapshot.dn);
    uploadRateHistory.push(snapshot.up);
  });

  callback(error, {
    download: downloadRateHistory,
    upload: uploadRateHistory
  });
};

let history = {
  get: function (opts, callback) {
    opts = opts || {};

    if (opts.snapshot === 'fiveMin') {
      fiveMinSnapshot.getData(opts, processData.bind(this, opts, callback));
    } else if (opts.snapshot === 'thirtyMin') {
      thirtyMinSnapshot.getData(opts, processData.bind(this, opts, callback));
    } else if (opts.snapshot === 'hour') {
      hourSnapshot.getData(opts, processData.bind(this, opts, callback));
    } else if (opts.snapshot === 'day') {
      daySnapshot.getData(opts, processData.bind(this, opts, callback));
    } else if (opts.snapshot === 'week') {
      weekSnapshot.getData(opts, processData.bind(this, opts, callback));
    } else if (opts.snapshot === 'month') {
      monthSnapshot.getData(opts, processData.bind(this, opts, callback));
    } else if (opts.snapshot === 'year') {
      yearSnapshot.getData(opts, processData.bind(this, opts, callback));
    }
  },

  startPolling: function () {
    pollInterval = setInterval(function() {
      client.getTransferStats(function (err, data) {
        if (err) {
          return;
        }

        fiveMinSnapshot.addData({
          upload: data.uploadRate,
          download: data.downloadRate
        });
      });
    }, 1000 * 5);
  },

  stopPolling: function() {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

module.exports = history;
