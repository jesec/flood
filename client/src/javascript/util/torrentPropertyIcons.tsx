import {
  CalendarCreated,
  Calendar,
  Clock,
  DiskFlat,
  DownloadThick,
  FolderClosedSolid,
  Hash,
  Lock,
  TrackerMessage,
  Peers,
  Ratio,
  Seeds,
  Radar,
  UploadThick,
} from '@client/ui/icons';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

const ICONS: Partial<Record<TorrentListColumn, JSX.Element>> = {
  eta: <Clock />,
  sizeBytes: <DiskFlat />,
  downRate: <DownloadThick />,
  directory: <FolderClosedSolid />,
  hash: <Hash />,
  dateAdded: <Calendar />,
  dateCreated: <CalendarCreated />,
  isPrivate: <Lock />,
  message: <TrackerMessage />,
  percentComplete: <DownloadThick />,
  peers: <Peers />,
  ratio: <Ratio />,
  seeds: <Seeds />,
  trackerURIs: <Radar />,
  upRate: <UploadThick />,
  upTotal: <UploadThick />,
} as const;

export default ICONS;
