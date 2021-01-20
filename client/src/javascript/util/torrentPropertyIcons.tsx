import CalendarCreatedIcon from '@client/components/icons/CalendarCreatedIcon';
import CalendarIcon from '@client/components/icons/CalendarIcon';
import ClockIcon from '@client/components/icons/ClockIcon';
import DiskIcon from '@client/components/icons/DiskIcon';
import DownloadThickIcon from '@client/components/icons/DownloadThickIcon';
import HashIcon from '@client/components/icons/HashIcon';
import FolderClosedSolid from '@client/components/icons/FolderClosedSolid';
import PeersIcon from '@client/components/icons/PeersIcon';
import LockIcon from '@client/components/icons/LockIcon';
import RadarIcon from '@client/components/icons/RadarIcon';
import RatioIcon from '@client/components/icons/RatioIcon';
import SeedsIcon from '@client/components/icons/SeedsIcon';
import TrackerMessageIcon from '@client/components/icons/TrackerMessageIcon';
import UploadThickIcon from '@client/components/icons/UploadThickIcon';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

const ICONS: Partial<Record<TorrentListColumn, JSX.Element>> = {
  eta: <ClockIcon />,
  sizeBytes: <DiskIcon />,
  downRate: <DownloadThickIcon />,
  directory: <FolderClosedSolid />,
  hash: <HashIcon />,
  dateAdded: <CalendarIcon />,
  dateCreated: <CalendarCreatedIcon />,
  isPrivate: <LockIcon />,
  message: <TrackerMessageIcon />,
  percentComplete: <DownloadThickIcon />,
  peers: <PeersIcon />,
  ratio: <RatioIcon />,
  seeds: <SeedsIcon />,
  trackerURIs: <RadarIcon />,
  upRate: <UploadThickIcon />,
  upTotal: <UploadThickIcon />,
} as const;

export default ICONS;
