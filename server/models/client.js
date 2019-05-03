const fs = require('fs');
const path = require('path');
const series = require('run-series');
const tar = require('tar-stream');

const ClientRequest = require('./ClientRequest');
const clientResponseUtil = require('../util/clientResponseUtil');
const clientSettingsMap = require('../../shared/constants/clientSettingsMap');
const settings = require('./settings');
const torrentFilePropsMap = require('../../shared/constants/torrentFilePropsMap');
const torrentPeerPropsMap = require('../../shared/constants/torrentPeerPropsMap');
const torrentStatusMap = require('../../shared/constants/torrentStatusMap');
const torrentTrackerPropsMap = require('../../shared/constants/torrentTrackerPropsMap');

const client = {
  addFiles(user, services, req, callback) {
    const {files} = req;
    const {destination: destinationPath, isBasePath, start} = req.body;
    let {tags} = req.body;
    const request = new ClientRequest(user, services);

    if (!Array.isArray(tags)) {
      tags = tags.split(',');
    }

    request.createDirectory({path: destinationPath});
    request.send();

    // Each torrent is sent individually because rTorrent accepts a total
    // filesize of 524 kilobytes or less. This allows the user to send many
    // torrent files reliably.
    files.forEach((file, index) => {
      file.originalname = encodeURIComponent(file.originalname);

      const fileRequest = new ClientRequest(user, services);
      fileRequest.addFiles({
        files: file,
        path: destinationPath,
        isBasePath,
        start,
        tags,
      });

      // Set the callback for only the last request.
      if (index === files.length - 1) {
        fileRequest.onComplete((response, error) => {
          services.torrentService.fetchTorrentList();
          callback(response, error);
        });
      }

      fileRequest.send();
    });

    settings.set(user, {id: 'startTorrentsOnLoad', data: start});
  },

  addUrls(user, services, data, callback) {
    const {urls, path: destinationPath, isBasePath, start, tags} = data;
    const request = new ClientRequest(user, services);

    request.createDirectory({path: destinationPath});
    request.addURLs({
      urls,
      path: destinationPath,
      isBasePath,
      start,
      tags,
    });
    request.onComplete(callback);
    request.send();

    settings.set(user, {id: 'startTorrentsOnLoad', data: start});
  },

  checkHash(user, services, hashes, callback) {
    const request = new ClientRequest(user, services);

    request.checkHash({hashes});
    request.onComplete((response, error) => {
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  downloadFiles(user, services, hash, fileString, res) {
    try {
      const selectedTorrent = services.torrentService.getTorrent(hash);
      if (!selectedTorrent) return res.status(404).json({error: 'Torrent not found.'});

      this.getTorrentDetails(user, services, hash, torrentDetails => {
        if (!torrentDetails) return res.status(404).json({error: 'Torrent details not found'});

        let files;
        if (!fileString) {
          files = torrentDetails.fileTree.files.map((x, i) => `${i}`);
        } else {
          files = fileString.split(',');
        }

        const filePathsToDownload = this.findFilesByIndicies(files, torrentDetails.fileTree).map(file =>
          path.join(selectedTorrent.directory, file.path),
        );

        if (filePathsToDownload.length === 1) {
          const file = filePathsToDownload[0];
          if (!fs.existsSync(file)) return res.status(404).json({error: 'File not found.'});

          res.attachment(path.basename(file));
          return res.download(file);
        }

        res.attachment(`${selectedTorrent.name}.tar`);

        const pack = tar.pack();
        pack.pipe(res);

        const tasks = filePathsToDownload.map(filePath => {
          const filename = path.basename(filePath);

          return next => {
            fs.stat(filePath, (err, stats) => {
              if (err) return next(err);

              const stream = fs.createReadStream(filePath);
              const entry = pack.entry(
                {
                  name: filename,
                  size: stats.size,
                },
                next,
              );
              stream.pipe(entry);
            });
          };
        });

        series(tasks, error => {
          if (error) return res.status(500).json(error);

          pack.finalize();
        });
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  findFilesByIndicies(indices, fileTree = {}) {
    const {directories, files = []} = fileTree;

    let selectedFiles = files.filter(file => indices.includes(`${file.index}`));

    if (directories != null) {
      selectedFiles = selectedFiles.concat(
        Object.keys(directories).reduce(
          (accumulator, directory) => accumulator.concat(this.findFilesByIndicies(indices, directories[directory])),
          [],
        ),
      );
    }

    return selectedFiles;
  },

  getSettings(user, services, options, callback) {
    let requestedSettingsKeys = [];
    const request = new ClientRequest(user, services);
    const response = {};

    const outboundTransformation = {
      throttleGlobalDownMax: apiResponse => Number(apiResponse) / 1024,
      throttleGlobalUpMax: apiResponse => Number(apiResponse) / 1024,
      piecesMemoryMax: apiResponse => Number(apiResponse) / (1024 * 1024),
    };

    request.fetchSettings({
      options,
      setRequestedKeysArr: requestedSettingsKeysArr => {
        requestedSettingsKeys = requestedSettingsKeysArr;
      },
    });

    request.postProcess(data => {
      if (!data) {
        return null;
      }

      data.forEach((datum, index) => {
        let value = datum[0];
        const settingsKey = clientSettingsMap[requestedSettingsKeys[index]];

        if (outboundTransformation[settingsKey]) {
          value = outboundTransformation[settingsKey](value);
        }

        response[settingsKey] = value;
      });

      return response;
    });
    request.onComplete(callback);
    request.send();
  },

  getTorrentDetails(user, services, hash, callback) {
    const request = new ClientRequest(user, services);

    request.getTorrentDetails({
      hash,
      fileProps: torrentFilePropsMap.methods,
      peerProps: torrentPeerPropsMap.methods,
      trackerProps: torrentTrackerPropsMap.methods,
    });
    request.postProcess(clientResponseUtil.processTorrentDetails);
    request.onComplete(callback);
    request.send();
  },

  listMethods(user, services, method, args, callback) {
    const request = new ClientRequest(user, services);

    request.listMethods({method, args});
    request.onComplete(callback);
    request.send();
  },

  moveTorrents(user, services, data, callback) {
    const destinationPath = data.destination;
    const {isBasePath, hashes, filenames, moveFiles, sourcePaths} = data;
    const mainRequest = new ClientRequest(user, services);

    const hashesToRestart = hashes.filter(
      hash => !services.torrentService.getTorrent(hash).status.includes(torrentStatusMap.stopped),
    );

    let afterCheckHash;

    if (hashesToRestart.length) {
      afterCheckHash = () => {
        const startTorrentsRequest = new ClientRequest(user, services);
        startTorrentsRequest.startTorrents({hashes: hashesToRestart});
        startTorrentsRequest.onComplete(callback);
        startTorrentsRequest.send();
      };
    } else {
      afterCheckHash = callback;
    }

    const checkHash = () => {
      const checkHashRequest = new ClientRequest(user, services);
      checkHashRequest.checkHash({hashes});
      checkHashRequest.onComplete(afterCheckHash);
      checkHashRequest.send();
    };

    const moveTorrents = () => {
      const moveTorrentsRequest = new ClientRequest(user, services);
      moveTorrentsRequest.onComplete(checkHash);
      moveTorrentsRequest.moveTorrents({
        filenames,
        sourcePaths,
        destinationPath,
      });
    };

    let afterSetPath = checkHash;

    if (moveFiles) {
      afterSetPath = moveTorrents;
    }

    mainRequest.stopTorrents({hashes});
    mainRequest.setDownloadPath({hashes, path: destinationPath, isBasePath});
    mainRequest.onComplete(afterSetPath);
    mainRequest.send();
  },

  setFilePriority(user, services, hashes, data, callback) {
    // TODO Add support for multiple hashes.
    const {fileIndices} = data;
    const request = new ClientRequest(user, services);

    request.setFilePriority({hashes, fileIndices, priority: data.priority});
    request.onComplete((response, error) => {
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  setPriority(user, services, hashes, data, callback) {
    const request = new ClientRequest(user, services);

    request.setPriority({hashes, priority: data.priority});
    request.onComplete((response, error) => {
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  setSettings(user, services, payloads, callback) {
    const request = new ClientRequest(user, services);
    if (payloads.length === 0) return callback({});

    const inboundTransformation = {
      throttleGlobalDownMax: userInput => ({
        id: userInput.id,
        data: Number(userInput.data) * 1024,
      }),
      throttleGlobalUpMax: userInput => ({
        id: userInput.id,
        data: Number(userInput.data) * 1024,
      }),
      piecesMemoryMax: userInput => ({
        id: userInput.id,
        data: (Number(userInput.data) * 1024 * 1024).toString(),
      }),
    };

    const transformedPayloads = payloads.map(payload => {
      if (inboundTransformation[payload.id]) {
        return inboundTransformation[payload.id](payload);
      }

      return payload;
    });

    request.setSettings({settings: transformedPayloads});
    request.onComplete(callback);
    request.send();
  },

  setSpeedLimits(user, services, data, callback) {
    const request = new ClientRequest(user, services);

    request.setThrottle({
      direction: data.direction,
      throttle: data.throttle,
    });
    request.onComplete(callback);
    request.send();
  },

  setTaxonomy(user, services, data, callback) {
    const request = new ClientRequest(user, services);

    request.setTaxonomy(data);
    request.onComplete((response, error) => {
      // Fetch the latest torrent list to re-index the taxonomy.
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  stopTorrent(user, services, hashes, callback) {
    const request = new ClientRequest(user, services);
    request.stopTorrents({hashes});
    request.onComplete((response, error) => {
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },

  startTorrent(user, services, hashes, callback) {
    const request = new ClientRequest(user, services);

    request.startTorrents({hashes});
    request.onComplete((response, error) => {
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },
};

module.exports = client;
