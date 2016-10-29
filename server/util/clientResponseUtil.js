'use strict';

let clientUtil = require('./clientUtil');
let clientGeneralPropsMap = require('../../shared/constants/clientGeneralPropsMap');
let torrentFilePropsMap = require('../../shared/constants/torrentFilePropsMap');
let torrentPeerPropsMap = require('../../shared/constants/torrentPeerPropsMap');
let torrentTrackerPropsMap = require('../../shared/constants/torrentTrackerPropsMap');
let util = require('util');

let getFileTreeFromPathsArr = (tree, directory, file, depth) => {
  if (depth == null) {
    depth = 0;
  }

  if (tree == null) {
    tree = {};
  }

  if (depth++ < file.pathComponents.length - 1) {
    if (!tree.directories) {
      tree.directories = {};
    }

    tree.directories[directory] = getFileTreeFromPathsArr(
      tree.directories[directory], file.pathComponents[depth], file, depth);
  } else {
    if (!tree.files) {
      tree.files = [];
    }

    tree.files.push(clientResponseUtil.processFile(file));
  }

  return tree;
};

let clientResponseUtil = {
  processTorrentDetails(data) {
    // TODO: This is ugly.
    let peersData = data[0][0] || null;
    let filesData = data[1][0] || null;
    let trackerData = data[2][0] || null;
    let peers = null;
    let files = null;
    let trackers = null;
    let fileTree = {};

    if (peersData && peersData.length) {
      peers = clientUtil.mapClientResponse(
        torrentPeerPropsMap.props,
        peersData
      );
    }

    if (filesData && filesData.length) {
      files = clientUtil.mapClientResponse(
        torrentFilePropsMap.props,
        filesData
      );

      fileTree = files.reduce((memo, file) => {
        return getFileTreeFromPathsArr(memo, file.pathComponents[0], file);
      }, {});
    }

    if (trackerData && trackerData.length) {
      trackers = clientUtil.mapClientResponse(
        torrentTrackerPropsMap.props,
        trackerData
      );
    }

    return {peers, trackers, fileTree};
  },

  processFile(file) {
    file.filename = file.pathComponents[file.pathComponents.length - 1];
    file.percentComplete = (file.completedChunks / file.sizeChunks * 100).toFixed(0);

    delete file.completedChunks;
    delete file.pathComponents;
    delete file.sizeChunks;

    return file;
  },

  processTransferStats(data) {
    return clientUtil.mapClientResponse(
      clientGeneralPropsMap.props,
      data
    );
  }
}

module.exports = clientResponseUtil;
