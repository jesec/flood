const geoip = require('geoip-lite');
const truncateTo = require('./numberUtils');
const torrentFilePropsMap = require('../../shared/constants/torrentFilePropsMap');
const torrentPeerPropsMap = require('../../shared/constants/torrentPeerPropsMap');
const torrentTrackerPropsMap = require('../../shared/constants/torrentTrackerPropsMap');

const getFileTreeFromPathsArr = (tree, directory, file, depth) => {
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
      tree.directories[directory],
      file.pathComponents[depth],
      file,
      depth
    );
  } else {
    if (!tree.files) {
      tree.files = [];
    }

    tree.files.push(clientResponseUtil.processFile(file));
  }

  return tree;
};

let clientResponseUtil = {
  mapPropsToResponse: (requestedKeys, clientResponse) => {
    if (clientResponse.length === 0) {
      return [];
    }

    // clientResponse is always an array of arrays.
    if (clientResponse[0].length === 1) {
      // When the length of the nested arrays is 1, the nested arrays represent a
      // singular requested value (e.g. total data transferred or current upload
      // speed). Therefore we construct an object where the requested keys map to
      // their values.
      return clientResponse.reduce((memo, value, index) => {
        memo[requestedKeys[index]] = value[0];

        return memo;
      }, {});
    } else {
      // When the length of the nested arrays is more than 1, the nested arrays
      // represent one of many items of the same type (e.g. a list of torrents,
      // peers, files, etc). Therefore we construct an array of objects, where each
      // object contains all of the requested keys and its value. We add an index
      // for each item, a requirement for file lists.
      return clientResponse.map((listItem, index) => {
        return listItem.reduce(
          (nestedMemo, value, nestedIndex) => {
            nestedMemo[requestedKeys[nestedIndex]] = value;

            return nestedMemo;
          },
          {index}
        );
      }, []);
    }
  },

  processFile(file) {
    file.filename = file.pathComponents[file.pathComponents.length - 1];
    file.percentComplete = truncateTo((file.completedChunks / file.sizeChunks) * 100);

    delete file.completedChunks;
    delete file.pathComponents;
    delete file.sizeChunks;

    return file;
  },

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
      peers = clientResponseUtil.mapPropsToResponse(torrentPeerPropsMap.props, peersData).map(peer => {
        let geoData = geoip.lookup(peer.address) || {};
        peer.country = geoData.country;

        // Strings to boolean
        peer.isEncrypted = peer.isEncrypted === '1';
        peer.isIncoming = peer.isIncoming === '1';

        return peer;
      });
    }

    if (filesData && filesData.length) {
      files = clientResponseUtil.mapPropsToResponse(torrentFilePropsMap.props, filesData);

      fileTree = files.reduce((memo, file) => {
        return getFileTreeFromPathsArr(memo, file.pathComponents[0], file);
      }, {});
    }

    if (trackerData && trackerData.length) {
      trackers = clientResponseUtil.mapPropsToResponse(torrentTrackerPropsMap.props, trackerData);
    }

    return {peers, trackers, fileTree};
  },
};

module.exports = clientResponseUtil;
