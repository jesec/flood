import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import ErrorIcon from '@client/components/icons/ErrorIcon';
import SpinnerIcon from '@client/components/icons/SpinnerIcon';
import StartIcon from '@client/components/icons/StartIcon';
import StopIcon from '@client/components/icons/StopIcon';

const STATUS_ICON_MAP: Partial<Record<TorrentStatus, JSX.Element>> = {
  error: <ErrorIcon />,
  checking: <SpinnerIcon />,
  stopped: <StopIcon />,
  downloading: <StartIcon />,
  seeding: <StartIcon />,
} as const;

function torrentStatusIcons(statuses: Array<TorrentStatus>) {
  let resultIcon: JSX.Element = <StopIcon />;
  Object.entries(STATUS_ICON_MAP).some(([status, icon]) => {
    if (statuses.includes(status as TorrentStatus) && icon != null) {
      resultIcon = icon;
      return true;
    }
    return false;
  });
  return resultIcon;
}

export default torrentStatusIcons;
