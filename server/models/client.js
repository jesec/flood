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

    // TODO: Clean this up, it's ugly.
    // Each torrent is sent individually because rTorrent accepts a total
    // filesize of 524 kilobytes or less.
    files.forEach((file, index) => {
      let fileRequest = new ClientRequest();
      fileRequest.add('addFiles', {files: file, path});
      // Call the callback on the last request.
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
    callback(null, _statusCount);
  },

  getTorrentTrackerCount: function(callback) {
    callback(null, _trackerCount);
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
    // loop through the torrents:
    //  stop torrents, call d.stop and d.close
    //  move torrents
    //  set new torrent directory
    //  start torrents, call d.start and d.open
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
