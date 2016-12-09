'use strict';
const formatUtil = require('../../shared/util/formatUtil');
const moment = require('moment');

let client = require('./client');
let config = require('../../config');
let HistoryEra = require('./HistoryEra');

let pollInterval = null;

let yearSnapshot = new HistoryEra({
  interval: 1000 * 60 * 60 * 24 * 7, // 7 days
  name: 'yearSnapshot',
  maxTime: 0 // infinite
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

let processData = (opts, callback, data, error) => {
  if (error) {
    callback(null, error);
    return;
  }

  const currentTime = moment(Date.now());
  data = data.slice(data.length - config.maxHistoryStates);

  callback(data.reduce((accumulator, snapshot, index) => {
    const time = formatUtil.secondsToDuration(
      moment.duration(currentTime.diff(moment(snapshot.ts))).asSeconds()
    );

    time.ts = snapshot.ts;

    accumulator.download.push(snapshot.dn);
    accumulator.upload.push(snapshot.up);
    accumulator.timestamps.push(time);

    return accumulator;
  }, {upload: [], download: [], timestamps: []}));
};

let history = {
  get: (opts, callback) => {
    opts = opts || {};

    let historyCallback = processData.bind(this, opts, callback);

    if (opts.snapshot === 'fiveMin') {
      fiveMinSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === 'thirtyMin') {
      thirtyMinSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === 'hour') {
      hourSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === 'day') {
      daySnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === 'week') {
      weekSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === 'month') {
      monthSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === 'year') {
      yearSnapshot.getData(opts, historyCallback);
    }
  },

  startPolling: () => {
    pollInterval = setInterval(() => {
      client.getTransferStats((data, err) => {
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

  stopPolling: () => {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

module.exports = history;
