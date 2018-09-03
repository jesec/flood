const clientGatewayServiceEvents = require('../constants/clientGatewayServiceEvents');
const historyServiceEvents = require('../constants/historyServiceEvents');
const historySnapshotTypes = require('../../shared/constants/historySnapshotTypes');
const notificationServiceEvents = require('../constants/notificationServiceEvents');
const ServerEvent = require('../models/ServerEvent');
const serverEventTypes = require('../../shared/constants/serverEventTypes');
const services = require('../services');
const taxonomyServiceEvents = require('../constants/taxonomyServiceEvents');
const torrentServiceEvents = require('../constants/torrentServiceEvents');

module.exports = (req, res) => {
  const {
    query: {historySnapshot = historySnapshotTypes.FIVE_MINUTE},
    user,
  } = req;

  const serviceInstances = services.getAllServices(user);
  const serverEvent = new ServerEvent(res);
  const taxonomy = serviceInstances.taxonomyService.getTaxonomy();
  const torrentList = serviceInstances.torrentService.getTorrentList();
  const transferSummary = serviceInstances.historyService.getTransferSummary();

  // Remove all previous event listeners.
  serviceInstances.historyService.removeAllListeners();
  serviceInstances.notificationService.removeAllListeners();
  serviceInstances.taxonomyService.removeAllListeners();
  serviceInstances.torrentService.removeAllListeners();

  // Emit current state immediately on connection.
  serverEvent.setID(Date.now());
  serverEvent.setType(serverEventTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE);
  serverEvent.addData({isConnected: !serviceInstances.clientGatewayService.hasError});
  serverEvent.emit();

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

  serverEvent.setID(Date.now());
  serverEvent.setType(serverEventTypes.NOTIFICATION_COUNT_CHANGE);
  serverEvent.addData(serviceInstances.notificationService.getNotificationCount());
  serverEvent.emit();

  serviceInstances.clientGatewayService.on(clientGatewayServiceEvents.CLIENT_CONNECTION_STATE_CHANGE, () => {
    serverEvent.setID(Date.now());
    serverEvent.setType(serverEventTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE);
    serverEvent.addData({isConnected: !serviceInstances.clientGatewayService.hasError});
    serverEvent.emit();
  });

  // TODO: Handle empty or sub-optimal history states.
  // Get user's specified history snapshot current history.
  serviceInstances.historyService.getHistory({snapshot: historySnapshot}, (snapshot, error) => {
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
  serviceInstances.historyService.on(
    historyServiceEvents[`${historySnapshotTypes[historySnapshot]}_SNAPSHOT_FULL_UPDATE`],
    payload => {
      const {data, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.TRANSFER_HISTORY_FULL_UPDATE);
      serverEvent.addData(data);
      serverEvent.emit();
    }
  );

  serviceInstances.notificationService.on(notificationServiceEvents.NOTIFICATION_COUNT_CHANGE, payload => {
    const {data, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.NOTIFICATION_COUNT_CHANGE);
    serverEvent.addData(data);
    serverEvent.emit();
  });

  // Add diff event listeners.
  serviceInstances.historyService.on(historyServiceEvents.TRANSFER_SUMMARY_DIFF_CHANGE, payload => {
    const {diff, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.TRANSFER_SUMMARY_DIFF_CHANGE);
    serverEvent.addData(diff);
    serverEvent.emit();
  });

  serviceInstances.taxonomyService.on(taxonomyServiceEvents.TAXONOMY_DIFF_CHANGE, payload => {
    const {diff, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.TAXONOMY_DIFF_CHANGE);
    serverEvent.addData(diff);
    serverEvent.emit();
  });

  serviceInstances.torrentService.on(torrentServiceEvents.TORRENT_LIST_DIFF_CHANGE, payload => {
    const {diff, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.TORRENT_LIST_DIFF_CHANGE);
    serverEvent.addData(diff);
    serverEvent.emit();
  });
};
