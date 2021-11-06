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
  mountPoints: Array<string>;

  // Last selection state of "Delete data" toggle
  deleteTorrentData: boolean;

  // Last selection state of "Start Torrent" toggle
  startTorrentsOnLoad: boolean;

  // Preferred download destinations by tags
  // currently set to the last used download destinations
  // value of property '' is the default preferred destination
  torrentDestinations?: Record<string, string>;

  // Tag selector preference
  UITagSelectorMode?: 'single' | 'multi';

  // Last used "Add Torrents" tab
  UITorrentsAddTab?: 'by-url' | 'by-file' | 'by-creation';

  // Display upload and download speed in page title
  UIPageTitleSpeedEnabled: boolean;
}

export type FloodSetting = keyof FloodSettings;
