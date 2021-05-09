import type {TorrentProperties} from '@shared/types/Torrent';

import type {DelugeCoreTorrentStatuses} from '../types/DelugeCoreMethods';

export const getTorrentStatusFromStatuses = ({
  progress,
  state,
  download_payload_rate,
  upload_payload_rate,
}: Pick<
  DelugeCoreTorrentStatuses,
  'progress' | 'state' | 'download_payload_rate' | 'upload_payload_rate'
>): TorrentProperties['status'] => {
  const result: TorrentProperties['status'] = [];

  switch (state) {
    case 'Checking':
      result.push('checking');
      break;
    case 'Downloading':
    case 'Queued':
      result.push('downloading');
      break;
    case 'Seeding':
      result.push('seeding');
      break;
    case 'Paused':
      result.push('stopped');
      break;
    default:
      result.push('error');
      break;
  }

  if (progress === 100) {
    result.push('complete');
  }

  if (download_payload_rate > 0 || upload_payload_rate > 0) {
    result.push('active');
  } else {
    result.push('inactive');
  }

  return result;
};
