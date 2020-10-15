import type {Language} from '../../client/src/javascript/constants/Languages';
import type {TorrentContextMenuAction} from '../../client/src/javascript/constants/TorrentContextMenuActions';
import type {TorrentListColumn} from '../../client/src/javascript/constants/TorrentListColumns';

export interface FloodSettings {
  language: Language;
  sortTorrents: {
    direction: 'desc' | 'asc';
    property: TorrentListColumn;
  };
  torrentListColumns: Array<{
    id: TorrentListColumn;
    visible: boolean;
  }>;
  torrentListColumnWidths: Record<TorrentListColumn, number>;
  torrentContextMenuActions: Array<{
    id: TorrentContextMenuAction;
    visible: boolean;
  }>;
  torrentListViewSize: 'condensed' | 'expanded';
  speedLimits: {
    download: Array<number>;
    upload: Array<number>;
  };
  startTorrentsOnLoad: boolean;
  mountPoints: Array<string>;

  // Below: default setting is not specified
  torrentDestination?: string;
  deleteTorrentData?: boolean;
}

export type FloodSetting = keyof FloodSettings;
