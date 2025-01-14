import type {TorrentProperties} from '../../../../shared/types/Torrent';
import type {TransmissionTorrentProperties} from '../types/TransmissionTorrentsMethods';
import {TransmissionTorrentError, TransmissionTorrentStatus} from '../types/TransmissionTorrentsMethods';

const getTorrentStatus = (
  properties: Pick<
    TransmissionTorrentProperties,
    'error' | 'status' | 'rateDownload' | 'rateUpload' | 'haveValid' | 'totalSize'
  >,
): TorrentProperties['status'] => {
  const {error, status, rateDownload, rateUpload, haveValid, totalSize} = properties;
  const statuses: TorrentProperties['status'] = [];

  switch (status) {
    case TransmissionTorrentStatus.TR_STATUS_CHECK:
    case TransmissionTorrentStatus.TR_STATUS_CHECK_WAIT:
      statuses.push('checking');
      break;
    case TransmissionTorrentStatus.TR_STATUS_DOWNLOAD:
    case TransmissionTorrentStatus.TR_STATUS_DOWNLOAD_WAIT:
      statuses.push('downloading');
      if (rateDownload > 0) {
        statuses.push('active');
      } else {
        statuses.push('inactive');
      }
      break;
    case TransmissionTorrentStatus.TR_STATUS_SEED:
    case TransmissionTorrentStatus.TR_STATUS_SEED_WAIT:
      statuses.push('seeding');
      if (rateUpload > 0) {
        statuses.push('active');
      } else {
        statuses.push('inactive');
      }
      break;
    case TransmissionTorrentStatus.TR_STATUS_STOPPED:
      statuses.push('stopped', 'inactive');
      break;
    default:
      break;
  }

  if (error !== TransmissionTorrentError.TR_STAT_OK) {
    statuses.push('error');
  }

  if (haveValid === totalSize) {
    statuses.push('complete');
  }

  return statuses;
};

export default {getTorrentStatus};
