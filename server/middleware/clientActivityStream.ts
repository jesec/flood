import type {Operation} from 'fast-json-patch';
import type {Request, Response} from 'express';
import type TypedEmitter from 'typed-emitter';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';

import DiskUsage from '../models/DiskUsage';
import ServerEvent from '../models/ServerEvent';
import services from '../services';

import type {DiskUsageSummary} from '../models/DiskUsage';
import type {TransferHistory} from '../../shared/types/TransferData';

export default async (req: Request<unknown, unknown, unknown, {historySnapshot: HistorySnapshot}>, res: Response) => {
  const {
    query: {historySnapshot = 'FIVE_MINUTE'},
    user,
  } = req;

  if (user == null) {
    return;
  }

  const serviceInstances = services.getAllServices(user);
  const serverEvent = new ServerEvent(res);
  const fetchTorrentList = serviceInstances.torrentService.fetchTorrentList();

  if (serviceInstances.clientGatewayService == null) {
    return;
  }

  // Hook into events and stop listening when connection is closed
  const handleEvents = <T extends TypedEmitter<Record<string, unknown>>>(
    emitter: T,
    event: Parameters<T['on']>[0],
    handler: Parameters<T['on']>[1],
  ) => {
    emitter.on(event, handler);
    res.on('close', () => {
      emitter.removeListener(event, handler);
    });
  };

  // Emit current state immediately on connection.
  serverEvent.emit(Date.now(), 'CLIENT_CONNECTIVITY_STATUS_CHANGE', {
    isConnected: serviceInstances.clientGatewayService.errorCount === 0,
  });

  // Disk usage change event
  handleEvents(DiskUsage, 'DISK_USAGE_CHANGE', (diskUsageChange: DiskUsageSummary) => {
    serverEvent.emit(diskUsageChange.id, 'DISK_USAGE_CHANGE', diskUsageChange.disks);
  });

  // Trigger an immediate update
  DiskUsage.updateDisks().catch((e) => console.error(e));

  const torrentList = (await fetchTorrentList) || serviceInstances.torrentService.getTorrentListSummary();
  const taxonomy = serviceInstances.taxonomyService.getTaxonomy();
  const transferSummary = serviceInstances.historyService.getTransferSummary();

  serverEvent.emit(torrentList.id, 'TORRENT_LIST_FULL_UPDATE', torrentList.torrents);
  serverEvent.emit(taxonomy.id, 'TAXONOMY_FULL_UPDATE', taxonomy.taxonomy);
  serverEvent.emit(transferSummary.id, 'TRANSFER_SUMMARY_FULL_UPDATE', transferSummary.transferSummary);
  serverEvent.emit(
    Date.now(),
    'NOTIFICATION_COUNT_CHANGE',
    serviceInstances.notificationService.getNotificationCount(),
  );

  handleEvents(serviceInstances.clientGatewayService, 'CLIENT_CONNECTION_STATE_CHANGE', (isConnected: boolean) => {
    serverEvent.emit(Date.now(), 'CLIENT_CONNECTIVITY_STATUS_CHANGE', {
      isConnected,
    });
  });

  if (serviceInstances.clientGatewayService.errorCount !== 0) {
    serviceInstances.clientGatewayService.testGateway().catch(console.error);
  }

  // Get user's specified history snapshot current history.
  serviceInstances.historyService.getHistory({snapshot: historySnapshot}, (snapshot, error) => {
    const {timestamps: lastTimestamps} = snapshot || {timestamps: []};
    const lastTimestamp = lastTimestamps[lastTimestamps.length - 1];

    if (error == null && snapshot != null && lastTimestamp != null) {
      serverEvent.emit(lastTimestamp, 'TRANSFER_HISTORY_FULL_UPDATE', snapshot);
    } else {
      const fallbackHistory: TransferHistory = {download: [0], upload: [0], timestamps: [Date.now()]};
      serverEvent.emit(Date.now(), 'TRANSFER_HISTORY_FULL_UPDATE', fallbackHistory);
    }
  });

  // Add user's specified history snapshot change event listener.
  handleEvents(serviceInstances.notificationService, 'NOTIFICATION_COUNT_CHANGE', (payload) => {
    const {data, id} = payload;
    serverEvent.emit(id, 'NOTIFICATION_COUNT_CHANGE', data);
  });

  // Add diff event listeners.
  handleEvents(
    serviceInstances.torrentService,
    'TORRENT_LIST_DIFF_CHANGE',
    ({id, diff}: {id: number; diff: Operation[]}) => {
      serverEvent.emit(id, 'TORRENT_LIST_DIFF_CHANGE', diff);
    },
  );

  handleEvents(serviceInstances.taxonomyService, 'TAXONOMY_DIFF_CHANGE', (payload) => {
    const {diff, id} = payload;
    serverEvent.emit(id, 'TAXONOMY_DIFF_CHANGE', diff);
  });

  handleEvents(
    serviceInstances.historyService,
    'TRANSFER_SUMMARY_DIFF_CHANGE',
    ({id, diff}: {id: number; diff: Operation[]}) => {
      serverEvent.emit(id, 'TRANSFER_SUMMARY_DIFF_CHANGE', diff);
    },
  );
};
