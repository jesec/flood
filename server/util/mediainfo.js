'use strict';

let child_process = require('child_process');

let client = require('../models/client');

module.exports = {
  getMediainfo(options, callback) {
    let hash = options.hash;

    if (hash == null) {
      callback(null, {error: 'Hash must be defined'});
      return;
    }

    client.getTorrent({hash}, (details, error) => {
      if (error) {
        callback(null, {error});
        return;
      }

      try {
        child_process.execFile(
          'mediainfo', [details.directory], function(error, stdout, stderr) {
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
    });
  }
};
