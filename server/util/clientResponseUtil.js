'use strict';

let clientUtil = require('./clientUtil');
let util = require('util');

let clientResponseUtil = {
  processTorrentDetails: function(data) {
    // TODO: This is ugly.
    let peersData = data[0][0] || null;
    let filesData = data[1][0] || null;
    let trackerData = data[2][0] || null;
    let peers = null;
    let files = null;
    let trackers = null;

    if (peersData && peersData.length) {
      peers = clientUtil.mapClientProps(
        clientUtil.defaults.peerProperties,
        peersData
      );
    }

    if (filesData && filesData.length) {
      files = clientUtil.mapClientProps(
        clientUtil.defaults.fileProperties,
        filesData
      );

      files = files.map(function (file) {
        file.filename = file.pathComponents[file.pathComponents.length - 1];
        file.percentComplete = (file.completedChunks / file.sizeChunks * 100).toFixed(0);
        delete(file.completedChunks);
        delete(file.sizeChunks);
        return file;
      });
    }

    if (trackerData && trackerData.length) {
      trackers = clientUtil.mapClientProps(
        clientUtil.defaults.trackerProperties,
        trackerData
      );
    }

    return {peers, files, trackers};
  },

  processTransferStats: function(data) {
    return clientUtil.mapClientProps(clientUtil.defaults.clientProperties,
      data);
  }
}

module.exports = clientResponseUtil;
