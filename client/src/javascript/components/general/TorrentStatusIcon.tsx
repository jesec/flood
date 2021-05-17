import {FC, memo} from 'react';

import {Error, Spinner, Start, Stop} from '@client/ui/icons';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

const STATUS_ICON_MAP: Partial<Record<TorrentStatus, JSX.Element>> = {
  error: <Error />,
  checking: <Spinner />,
  stopped: <Stop />,
  downloading: <Start />,
  seeding: <Start />,
} as const;

interface TorrentStatusIconProps {
  statuses: TorrentStatus[];
}

const TorrentStatusIcon: FC<TorrentStatusIconProps> = ({statuses}: TorrentStatusIconProps) => {
  let resultIcon = <Stop />;

  Object.keys(STATUS_ICON_MAP).some((key) => {
    const status = key as TorrentStatus;
    if (statuses.includes(status)) {
      const icon = STATUS_ICON_MAP[status];
      if (icon != null) {
        resultIcon = icon;
        return true;
      }
    }
    return false;
  });

  return resultIcon;
};

export default memo(TorrentStatusIcon);
