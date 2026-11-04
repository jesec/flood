import {describe, expect, it} from 'vitest';

import {TransmissionTorrentError, TransmissionTorrentStatus} from '../types/TransmissionTorrentsMethods';
import torrentPropertiesUtil from './torrentPropertiesUtil';

const downloading = {
  error: TransmissionTorrentError.TR_STAT_OK,
  status: TransmissionTorrentStatus.TR_STATUS_DOWNLOAD,
  rateDownload: 0,
  rateUpload: 0,
};

describe('getTorrentStatus', () => {
  it('does not report a magnet link without metadata as complete', () => {
    expect(torrentPropertiesUtil.getTorrentStatus({...downloading, haveValid: 0, totalSize: 0})).toEqual([
      'downloading',
      'inactive',
    ]);
  });

  it('does not report a partially downloaded torrent as complete', () => {
    expect(torrentPropertiesUtil.getTorrentStatus({...downloading, haveValid: 512, totalSize: 1024})).toEqual([
      'downloading',
      'inactive',
    ]);
  });

  it('reports a fully downloaded torrent as complete', () => {
    expect(
      torrentPropertiesUtil.getTorrentStatus({
        ...downloading,
        status: TransmissionTorrentStatus.TR_STATUS_SEED,
        haveValid: 1024,
        totalSize: 1024,
      }),
    ).toEqual(['seeding', 'inactive', 'complete']);
  });
});
