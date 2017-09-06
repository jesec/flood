'use strict';

let child_process = require('child_process');

const torrentService = require('../services/torrentService');

module.exports = {
  getMediainfo(options, callback) {
    let hash = options.hash;

    if (hash == null) {
      callback(null, {error: 'Hash must be defined'});
      return;
    }
    const selectedTorrent = torrentService.getTorrent(hash);
    try {
      child_process.execFile(
        'mediainfo', [selectedTorrent.basePath], {maxBuffer: 1024 * 2000}, function(error, stdout, stderr) {
          if (error) {
            callback(null, {error});
            return;
          }

          if (stderr) {
            callback(null, {error: stderr});
            return;
          }

          callback({output: stdout});
        }
      );
    } catch (childProcessError) {
      callback(null, {error: childProcessError});
    }
  }
};
