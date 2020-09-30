import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import {series} from 'async';
import tar from 'tar-stream';

import ClientRequest from './ClientRequest';
import clientResponseUtil from '../util/clientResponseUtil';
import {clientSettingsBiMap} from '../../shared/constants/clientSettingsMap';
import fileUtil from '../util/fileUtil';
import settings from './settings';
import torrentFilePropsMap from '../../shared/constants/torrentFilePropsMap';
import torrentPeerPropsMap from '../../shared/constants/torrentPeerPropsMap';
import torrentFileUtil from '../util/torrentFileUtil';
import torrentTrackerPropsMap from '../../shared/constants/torrentTrackerPropsMap';

const client = {
  addFiles(user, services, options, callback) {
    const {destination: destinationPath, files, isBasePath, start, tags} = options;

    const resolvedPath = fileUtil.sanitizePath(destinationPath);
    if (!fileUtil.isAllowedPath(resolvedPath)) {
      callback(null, fileUtil.accessDeniedError());
      return;
    }

    fileUtil.createDirectory({path: resolvedPath});

    // Each torrent is sent individually because rTorrent accepts a total
    // filesize of 524 kilobytes or less. This allows the user to send many
    // torrent files reliably.
    files.forEach((file, index) => {
      const fileRequest = new ClientRequest(user, services);
      fileRequest.addFiles({
        files: [file],
        path: resolvedPath,
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

    settings.set(user, {id: 'startTorrentsOnLoad', data: start === 'true' || start === true});
  },

  addUrls(user, services, data, callback) {
    const {urls, destination, isBasePath, start, tags} = data;
    const request = new ClientRequest(user, services);
    const resolvedPath = fileUtil.sanitizePath(destination);
    if (!fileUtil.isAllowedPath(resolvedPath)) {
      callback(null, fileUtil.accessDeniedError());
      return;
    }
    fileUtil.createDirectory({path: resolvedPath});
    request.addURLs({
      urls,
      path: resolvedPath,
      isBasePath,
      start,
      tags,
    });
    request.onComplete(callback);
    request.send();

    settings.set(user, {id: 'startTorrentsOnLoad', data: start});
  },

  downloadFiles(user, services, hash, fileString, res) {
    try {
      const selectedTorrent = services.torrentService.getTorrent(hash);
      if (!selectedTorrent) return res.status(404).json({error: 'Torrent not found.'});

      this.getTorrentDetails(user, services, hash, (torrentDetails) => {
        if (!torrentDetails) return res.status(404).json({error: 'Torrent details not found'});

        let files;
        if (!fileString || fileString === 'all') {
          files = torrentDetails.fileTree.files.map((x, i) => `${i}`);
        } else {
          files = fileString.split(',');
        }

        const filePathsToDownload = this.findFilesByIndicies(files, torrentDetails.fileTree).map((file) =>
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

        const tasks = filePathsToDownload.map((filePath) => {
          const filename = path.basename(filePath);

          return (next) => {
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

        series(tasks, (error) => {
          if (error) res.status(500).json(error);

          pack.finalize();
        });
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  findFilesByIndicies(indices, fileTree = {}) {
    const {directories, files = []} = fileTree;

    let selectedFiles = files.filter((file) => indices.includes(`${file.index}`));

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
      throttleGlobalDownMax: (apiResponse) => Number(apiResponse) / 1024,
      throttleGlobalUpMax: (apiResponse) => Number(apiResponse) / 1024,
      piecesMemoryMax: (apiResponse) => Number(apiResponse) / (1024 * 1024),
    };

    request.fetchSettings({
      options,
      setRequestedKeysArr: (requestedSettingsKeysArr) => {
        requestedSettingsKeys = requestedSettingsKeysArr;
      },
    });

    request.postProcess((data) => {
      if (!data) {
        return null;
      }

      data.forEach((datum, index) => {
        let value = datum[0];
        const settingsKey = clientSettingsBiMap[requestedSettingsKeys[index]];

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

    const inboundTransformations = new Map();
    inboundTransformations
      .set('throttleGlobalDownMax', (userInput) => ({
        id: userInput.id,
        data: Number(userInput.data) * 1024,
      }))
      .set('throttleGlobalUpMax', (userInput) => ({
        id: userInput.id,
        data: Number(userInput.data) * 1024,
      }))
      .set('piecesMemoryMax', (userInput) => ({
        id: userInput.id,
        data: (Number(userInput.data) * 1024 * 1024).toString(),
      }));

    const transformedPayloads = payloads.map((payload) => {
      if (inboundTransformations.has(payload.id)) {
        const inboundTransformation = inboundTransformations.get(payload.id);
        return inboundTransformation(payload);
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

  setTracker(user, services, data, callback) {
    const request = new ClientRequest(user, services);

    request.getSessionPath();
    request.setTracker(data);
    request.postProcess((response) => {
      // Modify tracker URL in torrent files
      const {tracker, hashes} = data;
      const sessionPath = `${response.shift()}`;

      if (typeof sessionPath === 'string') {
        // Deduplicate hashes via Set() to avoid file ops on the same files
        [...new Set(hashes)].forEach((hash) => {
          const torrent = path.join(sessionPath, sanitize(`${hash}.torrent`));
          torrentFileUtil.setTracker(torrent, tracker);
        });
      }

      return response;
    });
    request.onComplete((response, error) => {
      // Fetch the latest torrent list to re-index trackerURI.
      services.torrentService.fetchTorrentList();
      callback(response, error);
    });
    request.send();
  },
};

export default client;
