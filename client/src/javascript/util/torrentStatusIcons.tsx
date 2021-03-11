import type {ReactNode} from 'react';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import {Error, Spinner, Start, Stop} from '@client/ui/icons';

const STATUS_ICON_MAP: Partial<Record<TorrentStatus, ReactNode>> = {
  error: <Error />,
  checking: <Spinner />,
  stopped: <Stop />,
  downloading: <Start />,
  seeding: <Start />,
} as const;

function torrentStatusIcons(statuses: Array<TorrentStatus>): ReactNode {
  let resultIcon: ReactNode = <Stop />;
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
