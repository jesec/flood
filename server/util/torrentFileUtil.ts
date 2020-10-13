import bencode from 'bencode';
import fs from 'fs';

import type {TorrentFile} from '@shared/types/TorrentFile';

const setTrackers = async (torrent: string, trackers: Array<string>) => {
  const torrentData: TorrentFile = bencode.decode(fs.readFileSync(torrent));

  torrentData.announce = Buffer.from(trackers[0]);

  if (trackers.length > 1 || torrentData['announce-list'] != null) {
    torrentData['announce-list'] = [];
    torrentData['announce-list'].push(
      trackers.map((tracker) => {
        return Buffer.from(tracker);
      }),
    );
  }

  return fs.writeFileSync(torrent, bencode.encode(torrentData));
};

const torrentFileUtil = {
  setTrackers,
};

export default torrentFileUtil;
