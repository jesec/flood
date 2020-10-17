import type {Request, Response} from 'express';
import type TypedEmitter from 'typed-emitter';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {TransferHistory, TransferSummaryDiff} from '@shared/types/TransferData';
import type {TorrentListDiff} from '@shared/types/Torrent';

import DiskUsage from '../models/DiskUsage';
import ServerEvent from '../models/ServerEvent';
import services from '../services';

import type {DiskUsageSummary} from '../models/DiskUsage';

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
  const fetchTorrentList = serviceInstances.torrentService.fetchTorrentList()?.catch((e) => console.error(e));

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
    isConnected: !serviceInstances.clientGatewayService.hasError,
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

  handleEvents(serviceInstances.clientGatewayService, 'CLIENT_CONNECTION_STATE_CHANGE', () => {
    serverEvent.emit(Date.now(), 'CLIENT_CONNECTIVITY_STATUS_CHANGE', {
      isConnected: !serviceInstances.clientGatewayService.hasError,
    });
  });

  if (serviceInstances.clientGatewayService.hasError) {
    serviceInstances.clientGatewayService.testGateway().catch(console.error);
  }

  // TODO: Handle empty or sub-optimal history states.
  // Get user's specified history snapshot current history.
  serviceInstances.historyService.getHistory({snapshot: historySnapshot}, (snapshot, error) => {
    const {timestamps: lastTimestamps} = snapshot || {timestamps: []};
    const lastTimestamp = lastTimestamps[lastTimestamps.length - 1];

    if (error == null && snapshot != null) {
      serverEvent.emit(lastTimestamp, 'TRANSFER_HISTORY_FULL_UPDATE', snapshot);
    }
  });

  // Add user's specified history snapshot change event listener.
  handleEvents(
    serviceInstances.historyService,
    `${historySnapshot}_SNAPSHOT_FULL_UPDATE` as 'FIVE_MINUTE_SNAPSHOT_FULL_UPDATE',
    (payload: {id: number; data: TransferHistory}) => {
      const {data, id} = payload;
      serverEvent.emit(id, 'TRANSFER_HISTORY_FULL_UPDATE', data);
    },
  );

  handleEvents(serviceInstances.notificationService, 'NOTIFICATION_COUNT_CHANGE', (payload) => {
    const {data, id} = payload;
    serverEvent.emit(id, 'NOTIFICATION_COUNT_CHANGE', data);
  });

  // Add diff event listeners.
  handleEvents(
    serviceInstances.torrentService,
    'TORRENT_LIST_DIFF_CHANGE',
    ({id, diff}: {id: number; diff: TorrentListDiff}) => {
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
    ({id, diff}: {id: number; diff: TransferSummaryDiff}) => {
      serverEvent.emit(id, 'TRANSFER_SUMMARY_DIFF_CHANGE', diff);
    },
  );
};
