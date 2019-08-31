const clientGatewayServiceEvents = require('../constants/clientGatewayServiceEvents');
const historyServiceEvents = require('../constants/historyServiceEvents');
const historySnapshotTypes = require('../../shared/constants/historySnapshotTypes');
const notificationServiceEvents = require('../constants/notificationServiceEvents');
const ServerEvent = require('../models/ServerEvent');
const serverEventTypes = require('../../shared/constants/serverEventTypes');
const services = require('../services');
const taxonomyServiceEvents = require('../constants/taxonomyServiceEvents');
const torrentServiceEvents = require('../constants/torrentServiceEvents');
const diskUsageServiceEvents = require('../constants/diskUsageServiceEvents');
const DiskUsageService = require('../services/diskUsageService');

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

  // Hook into events and stop listening when connection is closed
  const handleEvents = (emitter, event, handler) => {
    emitter.on(event, handler);
    res.on('close', () => {
      emitter.removeListener(event, handler);
    });
  };

  // Emit current state immediately on connection.
  serverEvent.setID(Date.now());
  serverEvent.setType(serverEventTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE);
  serverEvent.addData({isConnected: !serviceInstances.clientGatewayService.hasError});
  serverEvent.emit();

  const handleDiskUsageChange = diskUsageChange => {
    serverEvent.setID(diskUsageChange.id);
    serverEvent.setType(serverEventTypes.DISK_USAGE_CHANGE);
    serverEvent.addData(diskUsageChange.disks);
    serverEvent.emit();
  };

  DiskUsageService.updateDisks().then(() => {
    const diskUsage = DiskUsageService.getDiskUsage();
    serverEvent.setID(diskUsage.id);
    serverEvent.setType(serverEventTypes.DISK_USAGE_CHANGE);
    serverEvent.addData(diskUsage.disks);
    serverEvent.emit();
    handleEvents(DiskUsageService, diskUsageServiceEvents.DISK_USAGE_CHANGE, handleDiskUsageChange);
  });

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

  handleEvents(serviceInstances.clientGatewayService, clientGatewayServiceEvents.CLIENT_CONNECTION_STATE_CHANGE, () => {
    serverEvent.setID(Date.now());
    serverEvent.setType(serverEventTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE);
    serverEvent.addData({isConnected: !serviceInstances.clientGatewayService.hasError});
    serverEvent.emit();
  });

  if (serviceInstances.clientGatewayService.hasError) {
    serviceInstances.clientGatewayService.testGateway();
  }

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
  handleEvents(
    serviceInstances.historyService,
    historyServiceEvents[`${historySnapshotTypes[historySnapshot]}_SNAPSHOT_FULL_UPDATE`],
    payload => {
      const {data, id} = payload;

      serverEvent.setID(id);
      serverEvent.setType(serverEventTypes.TRANSFER_HISTORY_FULL_UPDATE);
      serverEvent.addData(data);
      serverEvent.emit();
    },
  );

  handleEvents(serviceInstances.notificationService, notificationServiceEvents.NOTIFICATION_COUNT_CHANGE, payload => {
    const {data, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.NOTIFICATION_COUNT_CHANGE);
    serverEvent.addData(data);
    serverEvent.emit();
  });

  // Add diff event listeners.
  handleEvents(serviceInstances.historyService, historyServiceEvents.TRANSFER_SUMMARY_DIFF_CHANGE, payload => {
    const {diff, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.TRANSFER_SUMMARY_DIFF_CHANGE);
    serverEvent.addData(diff);
    serverEvent.emit();
  });

  handleEvents(serviceInstances.taxonomyService, taxonomyServiceEvents.TAXONOMY_DIFF_CHANGE, payload => {
    const {diff, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.TAXONOMY_DIFF_CHANGE);
    serverEvent.addData(diff);
    serverEvent.emit();
  });

  handleEvents(serviceInstances.torrentService, torrentServiceEvents.TORRENT_LIST_DIFF_CHANGE, payload => {
    const {diff, id} = payload;

    serverEvent.setID(id);
    serverEvent.setType(serverEventTypes.TORRENT_LIST_DIFF_CHANGE);
    serverEvent.addData(diff);
    serverEvent.emit();
  });
};
