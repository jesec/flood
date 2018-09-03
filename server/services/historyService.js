const BaseService = require('./BaseService');
const config = require('../../config');
const HistoryEra = require('../models/HistoryEra');
const historyServiceEvents = require('../constants/historyServiceEvents');
const historySnapshotTypes = require('../../shared/constants/historySnapshotTypes');
const methodCallUtil = require('../util/methodCallUtil');
const objectUtil = require('../../shared/util/objectUtil');
const transferSummaryPropMap = require('../constants/transferSummaryPropMap');

const transferSummaryMethodCallConfig = methodCallUtil.getMethodCallConfigFromPropMap(transferSummaryPropMap);

const processData = (opts, callback, data, error) => {
  if (error) {
    callback(null, error);
    return;
  }

  data = data.slice(data.length - config.maxHistoryStates);

  callback(
    data.reduce(
      (accumulator, snapshot) => {
        accumulator.download.push(snapshot.dn);
        accumulator.upload.push(snapshot.up);
        accumulator.timestamps.push(snapshot.ts);

        return accumulator;
      },
      {upload: [], download: [], timestamps: []}
    )
  );
};

class HistoryService extends BaseService {
  constructor() {
    super(...arguments);

    this.errorCount = 0;
    this.lastSnapshots = {};
    this.pollTimeout = null;
    this.transferSummary = {};

    this.fetchCurrentTransferSummary = this.fetchCurrentTransferSummary.bind(this);
    this.handleFetchTransferSummaryError = this.handleFetchTransferSummaryError.bind(this);
    this.handleFetchTransferSummarySuccess = this.handleFetchTransferSummarySuccess.bind(this);

    this.yearSnapshot = new HistoryEra(this.user, {
      interval: 1000 * 60 * 60 * 24 * 7, // 7 days
      maxTime: 0, // infinite
      name: 'yearSnapshot',
    });

    this.monthSnapshot = new HistoryEra(this.user, {
      interval: 1000 * 60 * 60 * 12, // 12 hours
      maxTime: 1000 * 60 * 60 * 24 * 365, // 365 days
      name: 'monthSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60 * 24 * 7, // 7 days
      nextEra: this.yearSnapshot,
    });

    this.weekSnapshot = new HistoryEra(this.user, {
      interval: 1000 * 60 * 60 * 4, // 4 hours
      maxTime: 1000 * 60 * 60 * 24 * 7 * 24, // 24 weeks
      name: 'weekSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60 * 12, // 12 hours
      nextEra: this.monthSnapshot,
    });

    this.daySnapshot = new HistoryEra(this.user, {
      interval: 1000 * 60 * 60, // 60 minutes
      maxTime: 1000 * 60 * 60 * 24 * 30, // 30 days
      name: 'daySnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60 * 4, // 4 hours
      nextEra: this.weekSnapshot,
    });

    this.hourSnapshot = new HistoryEra(this.user, {
      interval: 1000 * 60 * 15, // 15 minutes
      maxTime: 1000 * 60 * 60 * 24, // 24 hours
      name: 'hourSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60, // 60 minutes
      nextEra: this.daySnapshot,
    });

    this.thirtyMinSnapshot = new HistoryEra(this.user, {
      interval: 1000 * 20, // 20 seconds
      maxTime: 1000 * 60 * 30, // 30 minutes
      name: 'thirtyMinSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 15, // 15 minutes
      nextEra: this.hourSnapshot,
    });

    this.fiveMinSnapshot = new HistoryEra(this.user, {
      interval: 1000 * 5, // 5 seconds
      maxTime: 1000 * 60 * 5, // 5 minutes
      name: 'fiveMinSnapshot',
      nextEraUpdateInterval: 1000 * 20, // 20 seconds
      nextEra: this.thirtyMinSnapshot,
    });

    this.fetchCurrentTransferSummary();
  }

  checkSnapshotDiffs() {
    Object.keys(historySnapshotTypes).forEach(snapshotType => {
      this.getHistory({snapshot: historySnapshotTypes[snapshotType]}, (nextSnapshot, error) => {
        if (error) {
          return;
        }

        const lastSnapshot = this.lastSnapshots[snapshotType] || {};
        const {timestamps = []} = lastSnapshot;
        const nextLastTimestamp = timestamps[timestamps.length - 1];
        const prevLastTimestamp = nextSnapshot.timestamps[nextSnapshot.timestamps.length - 1];

        if (nextLastTimestamp !== prevLastTimestamp) {
          this.emit(historyServiceEvents[`${snapshotType}_SNAPSHOT_FULL_UPDATE`], {
            id: nextLastTimestamp,
            data: nextSnapshot,
          });
        }

        this.lastSnapshots[snapshotType] = nextSnapshot;
      });
    });
  }

  deferFetchTransferSummary(interval = config.torrentClientPollInterval || 2000) {
    this.pollTimeout = setTimeout(this.fetchCurrentTransferSummary, interval);
  }

  destroy() {
    clearTimeout(this.pollTimeout);
  }

  fetchCurrentTransferSummary() {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    this.services.clientGatewayService
      .fetchTransferSummary(transferSummaryMethodCallConfig)
      .then(this.handleFetchTransferSummarySuccess.bind(this))
      .catch(this.handleFetchTransferSummaryError.bind(this));
  }

  getTransferSummary() {
    return {
      id: Date.now(),
      transferSummary: this.transferSummary,
    };
  }

  getHistory(opts = {}, callback) {
    const historyCallback = processData.bind(this, opts, callback);

    if (opts.snapshot === historySnapshotTypes.FIVE_MINUTE) {
      this.fiveMinSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === historySnapshotTypes.THIRTY_MINUTE) {
      this.thirtyMinSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === historySnapshotTypes.HOUR) {
      this.hourSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === historySnapshotTypes.DAY) {
      this.daySnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === historySnapshotTypes.WEEK) {
      this.weekSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === historySnapshotTypes.MONTH) {
      this.monthSnapshot.getData(opts, historyCallback);
    } else if (opts.snapshot === historySnapshotTypes.YEAR) {
      this.yearSnapshot.getData(opts, historyCallback);
    }
  }

  handleFetchTransferSummarySuccess(nextTransferSummary) {
    const summaryDiff = objectUtil.getDiff(this.transferSummary, nextTransferSummary);

    if (summaryDiff.length > 0) {
      this.emit(historyServiceEvents.TRANSFER_SUMMARY_DIFF_CHANGE, {
        diff: summaryDiff,
        id: Date.now(),
      });
    }

    this.errorCount = 0;
    this.transferSummary = nextTransferSummary;
    this.fiveMinSnapshot.addData({
      upload: nextTransferSummary.upRate,
      download: nextTransferSummary.downRate,
    });

    this.checkSnapshotDiffs();
    this.deferFetchTransferSummary();

    this.emit(historyServiceEvents.FETCH_TRANSFER_SUMMARY_SUCCESS);
  }

  handleFetchTransferSummaryError() {
    let nextInterval = config.torrentClientPollInterval || 2000;

    // If more than consecutive errors have occurred, then we delay the next
    // request.
    if (++this.errorCount >= 3) {
      nextInterval = Math.max(nextInterval + (this.errorCount * nextInterval) / 4, 1000 * 60);
    }

    this.deferFetchTransferSummary(nextInterval);

    this.emit(historyServiceEvents.FETCH_TRANSFER_SUMMARY_ERROR);
  }
}

module.exports = HistoryService;
