'use strict';

const historyService = require('../services/historyService');
const historyServiceEvents = require('../constants/historyServiceEvents');
const historySnapshotTypes = require('../../shared/constants/historySnapshotTypes');
const notificationService = require('../services/notificationService');
const notificationServiceEvents = require('../constants/notificationServiceEvents');
const ServerEvent = require('../models/ServerEvent');
const serverEventTypes = require('../../shared/constants/serverEventTypes');
const taxonomyService = require('../services/taxonomyService');
const taxonomyServiceEvents = require('../constants/taxonomyServiceEvents');
const torrentService = require('../services/torrentService');
const torrentServiceEvents = require('../constants/torrentServiceEvents');

module.exports = (req, res) => {
  const {query: {historySnapshot = historySnapshotTypes.FIVE_MINUTE}} = req;

  const serverEvent = new ServerEvent(res);
  const taxonomy = taxonomyService.getTaxonomy();
  const torrentList = torrentService.getTorrentList();
  const transferSummary = historyService.getTransferSummary();

  // Remove all previous event listeners.
  historyService.removeAllListeners();
  notificationService.removeAllListeners();
  taxonomyService.removeAllListeners();
  torrentService.removeAllListeners();

  // Emit all existing data.
  serverEvent.setID(torrentList.id);
  serverEvent.setType(serverEventTypes.TORRENT_LIST_FULL_UPDATE);
  serverEvent.addData(torrentList.torrents);
  serverEvent.emit();

  serverEvent.setID(taxonomy.id);
  serverEvent.setType(serverEventTypes.TAXONOMY_FULL_UPDATE);
  serverEvent.addData(taxonomy.taxonomy);
  serverEvent.emit();

  serverEvent.setID(transferSummary.id);
  serverEvent.setType(serverEventTypes.TRANSFER_SUMMARY_FULL_UPDATE);
  serverEvent.addData(transferSummary.transferSummary);
  serverEvent.emit();

  serverEvent.setID({id: Date.now()});
  serverEvent.setType(serverEventTypes.NOTIFICATION_COUNT_CHANGE);
  serverEvent.addData(notificationService.getNotificationCount());
  serverEvent.emit();

  // TODO: Handle empty or sub-optimal history states.
  // Get user's specified history snapshot current history.
  historyService.getHistory({snapshot: historySnapshot}, (snapshot, error) => {
    const {timestamps: lastTimestamps = []} = snapshot;
    const lastTimestamp = lastTimestamps[lastTimestamps.length - 1];

    if (error == null) {
      serverEvent.setID(lastTimestamp);
      serverEvent.setType(serverEventTypes.TRANSFER_HISTORY_FULL_UPDATE);
      serverEvent.addData(snapshot);
      serverEvent.emit();
    }
  });


  // Add user's specified history snapshot change event listener.
  historyService.on(
    historyServiceEvents[
      `${historySnapshotTypes[historySnapshot]}_SNAPSHOT_FULL_UPDATE`
    ],
    payload => {
      const {data, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.TRANSFER_HISTORY_FULL_UPDATE);
      serverEvent.addData(data);
      serverEvent.emit();
    }
  );

  notificationService.on(
    notificationServiceEvents.NOTIFICATION_COUNT_CHANGE,
    payload => {
      const {data, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.NOTIFICATION_COUNT_CHANGE);
      serverEvent.addData(data);
      serverEvent.emit();
    }
  );

  // Add diff event listeners.
  historyService.on(
    historyServiceEvents.TRANSFER_SUMMARY_DIFF_CHANGE,
    (payload) => {
      const {diff, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.TRANSFER_SUMMARY_DIFF_CHANGE);
      serverEvent.addData(diff);
      serverEvent.emit();
    }
  );

  taxonomyService.on(
    taxonomyServiceEvents.TAXONOMY_DIFF_CHANGE,
    (payload) => {
      const {diff, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.TAXONOMY_DIFF_CHANGE);
      serverEvent.addData(diff);
      serverEvent.emit();
    }
  );

  torrentService.on(
    torrentServiceEvents.TORRENT_LIST_DIFF_CHANGE,
    (payload) => {
      const {diff, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.TORRENT_LIST_DIFF_CHANGE);
      serverEvent.addData(diff);
      serverEvent.emit();
    }
  );
};
