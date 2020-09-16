import {execFile} from 'child_process';

import services from '../services';

export default {
  getMediainfo(user, options, callback) {
    const torrentService = services.getTorrentService(user);
    const {hash} = options;

    if (hash == null) {
      callback(null, {error: 'Hash must be defined'});
      return;
    }
    const selectedTorrent = torrentService.getTorrent(hash);
    try {
      execFile('mediainfo', [selectedTorrent.basePath], {maxBuffer: 1024 * 2000}, (error, stdout, stderr) => {
        if (error) {
          callback(null, {error});
          return;
        }

        if (stderr) {
          callback(null, {error: stderr});
          return;
        }

        callback({output: stdout});
      });
    } catch (childProcessError) {
      callback(null, {error: childProcessError});
    }
  },
};
