import type {Operation} from 'fast-json-patch';

import type {Disks} from './DiskUsage';
import type {NotificationCount} from './Notification';
import type {Taxonomy} from './Taxonomy';
import type {TorrentList} from './Torrent';
import type {TransferHistory, TransferSummary} from './TransferData';

// type: data
export interface ServerEvents {
  CLIENT_CONNECTIVITY_STATUS_CHANGE: {
    isConnected: boolean;
  };
  DISK_USAGE_CHANGE: Disks;
  NOTIFICATION_COUNT_CHANGE: NotificationCount;
  TAXONOMY_FULL_UPDATE: Taxonomy;
  TAXONOMY_DIFF_CHANGE: Operation[];
  TORRENT_LIST_FULL_UPDATE: TorrentList;
  TORRENT_LIST_DIFF_CHANGE: Operation[];
  TRANSFER_HISTORY_FULL_UPDATE: TransferHistory;
  TRANSFER_SUMMARY_FULL_UPDATE: TransferSummary;
}
