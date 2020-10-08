import type {TorrentProperties} from '../../shared/types/Torrent';

const hasTorrentFinished = (
  prevData: Partial<TorrentProperties> = {},
  nextData: Partial<TorrentProperties> = {},
): boolean => {
  if (prevData.status != null && prevData.status.includes('checking')) {
    return false;
  }

  if (prevData.percentComplete == null || nextData.percentComplete == null) {
    return false;
  }

  if (prevData.percentComplete < 100 && nextData.percentComplete === 100) {
    return true;
  }

  return false;
};

export default hasTorrentFinished;
