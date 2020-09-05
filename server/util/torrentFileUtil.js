const bencode = require('bencode');
const fs = require('fs');

const setTracker = (services, options) => {
  const {tracker, hashes} = options;

  [...new Set(hashes)].forEach((hash) => {
    const torrent = services.torrentService.getTorrent(hash).session.concat('.torrent');
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
  });
};

const torrentFileUtil = {
  setTracker,
};

module.exports = torrentFileUtil;
