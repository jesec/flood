import type {Request, Response} from 'express';
import type {Operation} from 'fast-json-patch';
import type {EventMap} from 'typed-emitter';
import type TypedEmitter from 'typed-emitter';

import type {TransferHistory} from '../../shared/types/TransferData';
import type {DiskUsageSummary} from '../models/DiskUsage';
import DiskUsage from '../models/DiskUsage';
import ServerEvent from '../models/ServerEvent';
import {getAllServices} from '../services';

export default async (req: Request, res: Response) => {
  const {user} = req;

  if (user == null) {
    return;
  }

  const serviceInstances = getAllServices(user);
  const serverEvent = new ServerEvent(res);
  const fetchTorrentList = serviceInstances.torrentService.fetchTorrentList();

  // Hook into events and stop listening when connection is closed
  const handleEvents = <T extends TypedEmitter<EventMap>>(
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
    isConnected: serviceInstances.clientGatewayService?.errorCount === 0,
  });

  // Don't proceed if client connection setting is unusable
  if (serviceInstances.clientGatewayService == null) {
    return;
  }

  // Client connection status change event
  handleEvents(serviceInstances.clientGatewayService, 'CLIENT_CONNECTION_STATE_CHANGE', (isConnected: boolean) => {
    serverEvent.emit(Date.now(), 'CLIENT_CONNECTIVITY_STATUS_CHANGE', {
      isConnected,
    });
  });

  // Trigger a retry if client connection failed
  if (serviceInstances.clientGatewayService.errorCount !== 0) {
    serviceInstances.clientGatewayService.testGateway().catch(console.error);
  }

  // Transfer history
  await serviceInstances.historyService.getHistory().then(
    (snapshot) => {
      const {timestamps: lastTimestamps} = snapshot || {timestamps: []};
      const lastTimestamp = lastTimestamps[lastTimestamps.length - 1];

      if (snapshot != null && lastTimestamp != null) {
        serverEvent.emit(lastTimestamp, 'TRANSFER_HISTORY_FULL_UPDATE', snapshot);
      } else {
        const fallbackHistory: TransferHistory = {
          download: [0],
          upload: [0],
          timestamps: [Date.now()],
        };
        serverEvent.emit(Date.now(), 'TRANSFER_HISTORY_FULL_UPDATE', fallbackHistory);
      }
    },
    () => undefined,
  );

  // Disk usage
  const disks = DiskUsage.getDiskUsage();
  serverEvent.emit(disks.id, 'DISK_USAGE_CHANGE', disks.disks);
  handleEvents(DiskUsage, 'DISK_USAGE_CHANGE', (diskUsageChange: DiskUsageSummary) => {
    serverEvent.emit(diskUsageChange.id, 'DISK_USAGE_CHANGE', diskUsageChange.disks);
  });

  // Torrent list
  const torrentList = (await fetchTorrentList) || serviceInstances.torrentService.getTorrentListSummary();
  serverEvent.emit(torrentList.id, 'TORRENT_LIST_FULL_UPDATE', torrentList.torrents);
  handleEvents(
    serviceInstances.torrentService,
    'TORRENT_LIST_DIFF_CHANGE',
    ({id, diff}: {id: number; diff: Operation[]}) => {
      serverEvent.emit(id, 'TORRENT_LIST_DIFF_CHANGE', diff);
    },
  );

  // Torrent taxonomy
  const taxonomy = serviceInstances.taxonomyService.getTaxonomy();
  serverEvent.emit(taxonomy.id, 'TAXONOMY_FULL_UPDATE', taxonomy.taxonomy);
  handleEvents(serviceInstances.taxonomyService, 'TAXONOMY_DIFF_CHANGE', (payload) => {
    const {diff, id} = payload;
    serverEvent.emit(id, 'TAXONOMY_DIFF_CHANGE', diff);
  });

  // Transfer summary
  const transferSummary = serviceInstances.historyService.getTransferSummary();
  serverEvent.emit(transferSummary.id, 'TRANSFER_SUMMARY_FULL_UPDATE', transferSummary.transferSummary);
  handleEvents(serviceInstances.historyService, 'TRANSFER_SUMMARY_FULL_UPDATE', ({id, summary}) => {
    serverEvent.emit(id, 'TRANSFER_SUMMARY_FULL_UPDATE', summary);
  });

  // Notifications
  serverEvent.emit(
    Date.now(),
    'NOTIFICATION_COUNT_CHANGE',
    serviceInstances.notificationService.getNotificationCount(),
  );
  handleEvents(serviceInstances.notificationService, 'NOTIFICATION_COUNT_CHANGE', (payload) => {
    const {data, id} = payload;
    serverEvent.emit(id, 'NOTIFICATION_COUNT_CHANGE', data);
  });
};
