import {FC, memo} from 'react';

import {CircleExclamation, Error, Spinner, Start, Stop} from '@client/ui/icons';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface TorrentStatusIconProps {
  status: TorrentStatus;
}

const TorrentStatusIcon: FC<TorrentStatusIconProps> = memo(({status}: TorrentStatusIconProps) => {
  switch (status) {
    case 'warning':
      return <CircleExclamation />;
    case 'error':
      return <Error />;
    case 'checking':
      return <Spinner />;
    case 'downloading':
      return <Start />;
    case 'seeding':
      return <Start />;
    default:
      return <Stop />;
  }
});

export default TorrentStatusIcon;
