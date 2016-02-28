'use strict';

let fs = require('fs');
let util = require('util');

let clientResponseUtil = require('../util/clientResponseUtil');
let ClientRequest = require('./ClientRequest');
let clientUtil = require('../util/clientUtil');
let propsMap = require('../../shared/constants/propsMap');
let formatUtil = require('../util/formatUtil');
let scgi = require('../util/scgi');
let Torrent = require('./Torrent');
let TorrentCollection = require('./TorrentCollection');

let _statusCount = {};
let _torrentCollection = new TorrentCollection();
let _trackerCount = {};

var client = {
  addFiles: function(req, callback) {
    let files = req.files;
    let path = req.body.destination;
    let request = new ClientRequest();

    request.add('createDirectory', {path});
    request.send();

    // Each torrent is sent individually because rTorrent accepts a total
    // filesize of 524 kilobytes or less. This allows the user to send many
    // torrent files reliably.
    files.forEach((file, index) => {
      let fileRequest = new ClientRequest();
      fileRequest.add('addFiles', {files: file, path});

      // Set the callback for only the last request.
      if (index === files.length - 1) {
        fileRequest.onComplete(function (data) {
          callback(data);
        });
      }

      fileRequest.send();
    });
  },

  addUrls: function(data, callback) {
    let urls = data.urls;
    let path = data.destination;
    let request = new ClientRequest();

    request.add('createDirectory', {path});
    request.add('addURLs', {urls, path});
    request.onComplete(callback);
    request.send();
  },

  deleteTorrents: function(hashes, callback) {
    let request = new ClientRequest();

    request.add('removeTorrents', {hashes});
    request.onComplete(callback);
    request.send();
  },

  getTorrentStatusCount: function(callback) {
    callback(_statusCount);
  },

  getTorrentTrackerCount: function(callback) {
    callback(_trackerCount);
  },

  getTorrentDetails: function(hash, callback) {
    let request = new ClientRequest();

    request.add('getTorrentDetails', {
      hash,
      fileProps: clientUtil.defaults.filePropertyMethods,
      peerProps: clientUtil.defaults.peerPropertyMethods,
      trackerProps: clientUtil.defaults.trackerPropertyMethods
    });
    request.postProcess(clientResponseUtil.processTorrentDetails);
    request.onComplete(callback);
    request.send();
  },

  getTorrentList: function(callback) {
    let request = new ClientRequest();

    request.add('getTorrentList',
      {props: clientUtil.defaults.torrentPropertyMethods});
    request.postProcess(function(data) {
      // TODO: Remove this nasty nested array business.
      _torrentCollection.updateTorrents(data[0][0]);
      _statusCount = _torrentCollection.statusCount;
      _trackerCount = _torrentCollection.trackerCount;

      return _torrentCollection.torrents;
    });
    request.onComplete(callback);
    request.send();
  },

  listMethods: function(method, args, callback) {
    let request = new ClientRequest();

    request.add('listMethods', {method, args});
    request.onComplete(callback);
    request.send();
  },

  moveFiles: function(data, callback) {
    let destinationPath = data.destination;
    let hashes = data.hashes;
    let sourcePath = data.source;
    let request = new ClientRequest();

    request.add('createDirectory', {path: destinationPath});
    request.add('stopTorrents', {hashes});
    request.onComplete(function () {
      request.add('moveTorrents', {hashes, destinationPath, sourcePath});
      request.add('startTorrents', {hashes});
      request.onComplete(callback);
    })
    request.send();
  },

  setFilePriority: function (hashes, data, callback) {
    // TODO Add support for multiple hashes.
    let fileIndex = data.fileIndices[0];
    let request = new ClientRequest();

    request.add('setFilePriority', {hashes, fileIndex, priority: data.priority});
    request.onComplete(callback);
    request.send();
  },

  setPriority: function (hashes, data, callback) {
    let request = new ClientRequest();

    request.add('setPriority', {hashes, priority: data.priority});
    request.onComplete(callback);
    request.send();
  },

  setSpeedLimits: function(data, callback) {
    let request = new ClientRequest();

    request.add('setThrottle',
      {direction: data.direction, throttle: data.throttle});
    request.onComplete(callback);
    request.send();
  },

  stopTorrent: function(hashes, callback) {
    let request = new ClientRequest();

    request.add('stopTorrents', {hashes});
    request.onComplete(callback);
    request.send();
  },

  startTorrent: function(hashes, callback) {
    let request = new ClientRequest();

    request.add('startTorrents', {hashes});
    request.onComplete(callback);
    request.send();
  },

  getTransferStats: function(callback) {
    let request = new ClientRequest();

    request.add('getTransferData');
    request.postProcess(clientResponseUtil.processTransferStats);
    request.onComplete(callback);
    request.send();
  }
};

module.exports = client;
