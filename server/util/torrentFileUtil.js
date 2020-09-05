const bencode = require('bencode');
const fs = require('fs');

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

module.exports = torrentFileUtil;
