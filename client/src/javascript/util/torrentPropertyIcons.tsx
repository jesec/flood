import CalendarCreatedIcon from '../components/icons/CalendarCreatedIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import ClockIcon from '../components/icons/ClockIcon';
import DiskIcon from '../components/icons/DiskIcon';
import DownloadThickIcon from '../components/icons/DownloadThickIcon';
import HashIcon from '../components/icons/HashIcon';
import FolderClosedSolid from '../components/icons/FolderClosedSolid';
import PeersIcon from '../components/icons/PeersIcon';
import LockIcon from '../components/icons/LockIcon';
import RadarIcon from '../components/icons/RadarIcon';
import RatioIcon from '../components/icons/RatioIcon';
import SeedsIcon from '../components/icons/SeedsIcon';
import TrackerMessageIcon from '../components/icons/TrackerMessageIcon';
import UploadThickIcon from '../components/icons/UploadThickIcon';

import type {TorrentListColumn} from '../constants/TorrentListColumns';

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
