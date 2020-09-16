import bencode from 'bencode';
import fs from 'fs';

const setTracker = (torrent, tracker) => {
  fs.readFile(torrent, (err, data) => {
    if (err) {
      return;
    }

    const torrentData = bencode.decode(data);

    if (torrentData.announce != null) {
      torrentData.announce = Buffer.from(tracker);

      fs.writeFileSync(torrent, bencode.encode(torrentData));
    }
  });
};

const torrentFileUtil = {
  setTracker,
};

export default torrentFileUtil;
