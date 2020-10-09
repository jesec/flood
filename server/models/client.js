import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import {series} from 'async';
import tar from 'tar-stream';

import ClientRequest from './ClientRequest';
import torrentFileUtil from '../util/torrentFileUtil';

const client = {
  downloadFiles(services, hash, fileString, res) {
    try {
      const selectedTorrent = services.torrentService.getTorrent(hash);
      if (!selectedTorrent) return res.status(404).json({error: 'Torrent not found.'});

      services.clientGatewayService.getTorrentContents(hash).then((contents) => {
        if (!contents) return res.status(404).json({error: 'Torrent contents not found'});

        let files;
        if (!fileString || fileString === 'all') {
          files = contents.files.map((x, i) => `${i}`);
        } else {
          files = fileString.split(',');
        }

        const filePathsToDownload = this.findFilesByIndices(files, contents).map((file) =>
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

  findFilesByIndices(indices, fileTree = {}) {
    const {directories, files = []} = fileTree;

    let selectedFiles = files.filter((file) => indices.includes(`${file.index}`));

    if (directories != null) {
      selectedFiles = selectedFiles.concat(
        Object.keys(directories).reduce(
          (accumulator, directory) => accumulator.concat(this.findFilesByIndices(indices, directories[directory])),
          [],
        ),
      );
    }

    return selectedFiles;
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
