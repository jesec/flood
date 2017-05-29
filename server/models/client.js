'use strict';

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const util = require('util');

const clientResponseUtil = require('../util/clientResponseUtil');
const clientSettingsMap = require('../../shared/constants/clientSettingsMap');
const ClientRequest = require('./ClientRequest');
const formatUtil = require('../../shared/util/formatUtil');
const scgi = require('../util/scgi');
const TemporaryStorage = require('./TemporaryStorage');
const torrentFilePropsMap = require('../../shared/constants/torrentFilePropsMap');
const torrentPeerPropsMap = require('../../shared/constants/torrentPeerPropsMap');
const torrentService = require('../services/torrentService');
const torrentTrackerPropsMap = require('../../shared/constants/torrentTrackerPropsMap');

var client = {
  addFiles: (req, callback) => {
    let files = req.files;
    let path = req.body.destination;
    let useBasePath = req.body.useBasePath || false;
    let request = new ClientRequest();
    let start = req.body.start;
    let tags = req.body.tags;

    if (!Array.isArray(tags)) {
      tags = tags.split(',');
    }

    request.createDirectory({path});
    request.send();

    // Each torrent is sent individually because rTorrent accepts a total
    // filesize of 524 kilobytes or less. This allows the user to send many
    // torrent files reliably.
    files.forEach((file, index) => {
      file.originalname = encodeURIComponent(file.originalname);

      let fileRequest = new ClientRequest();
      fileRequest.addFiles({files: file, path, useBasePath, start, tags});

      // Set the callback for only the last request.
      if (index === files.length - 1) {
        fileRequest.onComplete((response, error) => {
          torrentService.fetchTorrentList();
          callback(response, error);
        });
      }

      fileRequest.send();
    });
  },

  addUrls: (data, callback) => {
    let urls = data.urls;
    let path = data.destination;
    let start = data.start;
    let tags = data.tags;
    let request = new ClientRequest();

    request.createDirectory({path});
    request.addURLs({urls, path, start, tags});
    request.onComplete(callback);
    request.send();
  },

  checkHash: (hashes, callback) => {
    let request = new ClientRequest();

    request.checkHash({hashes});
    request.onComplete((response, error) => {
      torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  deleteTorrents: (options, callback) => {
    let filesToDelete = null;
    let eraseTorrentsRequest = new ClientRequest();

    eraseTorrentsRequest.removeTorrents({hashes: options.hashes});
    eraseTorrentsRequest.onComplete((response, error) => {
      if (options.deleteData) {
        const torrents = torrentCollection.torrents;

        options.hashes.forEach(hash => {
          let fileToDelete = null;
          const torrent = torrents[hash];

          if (torrent.isMultiFile && torrent.directory != null) {
            fileToDelete = torrent.directory;
          } else if (torrent.directory != null && torrent.name != null) {
            fileToDelete = path.join(torrent.directory, torrent.name);
          }

          if (fileToDelete != null) {
            rimraf(fileToDelete, {disableGlob: true}, error => {
              if (error) {
                console.error(`Error deleting file: ${fileToDelete}\n${error}`);
              }
            });
          }
        });
      }

      torrentService.fetchTorrentList();

      callback(response, error);
    });

    eraseTorrentsRequest.send();
  },

  downloadFiles(hash, files, res) {
    try {
      let selectedTorrent = null;

      this.getTorrent({hash}, (torrent) => {
        selectedTorrent = torrent;
      });

      this.getTorrentDetails(hash, (torrentDetails) => {
        const filePathsToDownload = this.findFilesByIndicies(
          files.split(','),
          torrentDetails.fileTree
        ).map((file) => {
          return path.join(selectedTorrent.directory, file.path);
        });

        if (filePathsToDownload.length === 1) {
          const file = filePathsToDownload[0];

          if (fs.existsSync(file)) {
            res.attachment(path.basename(file));
            res.download(file);
          } else {
            res.status(404).json({error: 'File not found.'});
          }
        } else {
          const tempFilename = `${hash}-${Date.now()}.tar`;
          const tempFilePath = TemporaryStorage.getTempPath(tempFilename);
          const archive = archiver('tar', {store: true});
          const output = fs.createWriteStream(tempFilePath);

          output.on('close', () => {
            const filename = `${selectedTorrent.name}.tar`;

            res.attachment(path.basename(filename));
            res.download(tempFilePath, filename, () => {
              TemporaryStorage.deleteFile(tempFilename);
            });
          });

          archive.on('error', (error) => {
            throw error;
          });

          archive.pipe(output);

          filePathsToDownload.forEach((filePath) => {
            const filename = path.basename(filePath);
            archive.append(fs.createReadStream(filePath), {name: filename});
          });

          archive.finalize();
        }
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  findFilesByIndicies(indices, fileTree = {}) {
    const {directories, files = []} = fileTree;

    let selectedFiles = files.filter(file => {
      return indices.includes(`${file.index}`);
    });

    if (directories != null) {
      selectedFiles = selectedFiles.concat(Object.keys(directories).reduce(
        (accumulator, directory) => {
          return accumulator.concat(
            this.findFilesByIndicies(indices, directories[directory])
          );
        },
        []
      ));
    }

    return selectedFiles;
  },

  getSettings: (options, callback) => {
    let requestedSettingsKeys = [];
    let request = new ClientRequest();
    let response = {};

    let outboundTransformation = {
      throttleGlobalDownMax: (apiResponse) => {
        return Number(apiResponse) / 1024;
      },
      throttleGlobalUpMax: (apiResponse) => {
        return Number(apiResponse) / 1024;
      },
      piecesMemoryMax: (apiResponse) => {
        return Number(apiResponse) / (1024 * 1024);
      }
    };

    request.fetchSettings({
      options,
      setRequestedKeysArr: (requestedSettingsKeysArr) => {
        requestedSettingsKeys = requestedSettingsKeysArr;
      }
    });

    request.postProcess((data) => {
      if (!data) {
        return null;
      }

      data.forEach((datum, index) => {
        let value = datum[0];
        let settingsKey = clientSettingsMap[requestedSettingsKeys[index]];

        if (!!outboundTransformation[settingsKey]) {
          value = outboundTransformation[settingsKey](value);
        }

        response[settingsKey] = value;
      });

      return response;
    });
    request.onComplete(callback);
    request.send();
  },

  getTorrentDetails: (hash, callback) => {
    let request = new ClientRequest();

    request.getTorrentDetails({
      hash,
      fileProps: torrentFilePropsMap.methods,
      peerProps: torrentPeerPropsMap.methods,
      trackerProps: torrentTrackerPropsMap.methods
    });
    request.postProcess(clientResponseUtil.processTorrentDetails);
    request.onComplete(callback);
    request.send();
  },

  listMethods: (method, args, callback) => {
    let request = new ClientRequest();

    request.listMethods({method, args});
    request.onComplete(callback);
    request.send();
  },

  moveTorrents: (data, callback) => {
    let destinationPath = data.destination;
    let hashes = data.hashes;
    let filenames = data.filenames;
    let moveFiles = data.moveFiles;
    let sourcePaths = data.sources;
    let mainRequest = new ClientRequest();

    let startTorrents = () => {
      let startTorrentsRequest = new ClientRequest();
      startTorrentsRequest.startTorrents({hashes});
      startTorrentsRequest.onComplete(callback);
      startTorrentsRequest.send();
    };

    let checkHash = () => {
      let checkHashRequest = new ClientRequest();
      checkHashRequest.checkHash({hashes});
      checkHashRequest.onComplete(afterCheckHash);
      checkHashRequest.send();
    };

    let moveTorrents = () => {
      let moveTorrentsRequest = new ClientRequest();
      moveTorrentsRequest.onComplete(checkHash);
      moveTorrentsRequest.moveTorrents({
        filenames, sourcePaths, destinationPath
      });
    };

    let afterCheckHash = startTorrents;
    let afterSetPath = checkHash;

    if (moveFiles) {
      afterSetPath = moveTorrents;
    }

    mainRequest.stopTorrents({hashes});
    mainRequest.setDownloadPath({hashes, path: destinationPath});
    mainRequest.onComplete(afterSetPath);
    mainRequest.send();
  },

  setFilePriority: (hashes, data, callback) => {
    // TODO Add support for multiple hashes.
    let fileIndices = data.fileIndices;
    let request = new ClientRequest();

    request.setFilePriority({hashes, fileIndices, priority: data.priority});
    request.onComplete((response, error) => {
      torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  setPriority: (hashes, data, callback) => {
    let request = new ClientRequest();

    request.setPriority({hashes, priority: data.priority});
    request.onComplete((response, error) => {
      torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  setSettings: (payloads, callback) => {
    let request = new ClientRequest();

    if (payloads.length === 0) {
      callback({});
      return;
    }

    let inboundTransformation = {
      throttleGlobalDownMax: (userInput) => {
        return {
          id: userInput.id,
          data: Number(userInput.data) * 1024
        };
      },
      throttleGlobalUpMax: (userInput) => {
        return {
          id: userInput.id,
          data: Number(userInput.data) * 1024
        };
      },
      piecesMemoryMax: (userInput) => {
        return {
          id: userInput.id,
          data: (Number(userInput.data) * 1024 * 1024).toString()
        };
      }
    };

    let transformedPayloads = payloads.map((payload) => {
      if (!!inboundTransformation[payload.id]) {
        return inboundTransformation[payload.id](payload);
      }

      return payload;
    });

    request.setSettings({settings: transformedPayloads});
    request.onComplete(callback);
    request.send();
  },

  setSpeedLimits: (data, callback) => {
    let request = new ClientRequest();

    request.setThrottle({
      direction: data.direction,
      throttle: data.throttle
    });
    request.onComplete(callback);
    request.send();
  },

  setTaxonomy: (data, callback) => {
    let request = new ClientRequest();

    request.setTaxonomy(data);
    request.onComplete((response, error) => {
      // Fetch the latest torrent list to re-index the taxonomy.
      torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  stopTorrent: (hashes, callback) => {
    let request = new ClientRequest();

    request.stopTorrents({hashes});
    request.onComplete((response, error) => {
      torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  startTorrent: (hashes, callback) => {
    let request = new ClientRequest();

    request.startTorrents({hashes});
    request.onComplete((response, error) => {
      torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  }
};

module.exports = client;
