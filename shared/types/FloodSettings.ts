import Languages from '../../client/src/javascript/constants/Languages';
import TorrentContextMenuItems from '../../client/src/javascript/constants/TorrentContextMenuItems';
import TorrentProperties from '../../client/src/javascript/constants/TorrentProperties';

export interface FloodSettings {
  language: keyof typeof Languages;
  sortTorrents: {
    direction: 'desc' | 'asc';
    property: keyof typeof TorrentProperties;
  };
  torrentDetails: Array<{
    id: keyof typeof TorrentProperties;
    visible: boolean;
  }>;
  torrentListColumnWidths: {
    name?: number;
    percentComplete?: number;
  };
  torrentContextMenuItems: Array<{
    id: keyof typeof TorrentContextMenuItems;
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
