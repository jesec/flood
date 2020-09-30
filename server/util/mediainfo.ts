import {TorrentProperties} from '@shared/types/Torrent';
import childProcess from 'child_process';

import type {Request} from 'express';

export default {
  getMediainfo(
    services: Request['services'],
    hash: TorrentProperties['hash'],
    callback: (data: {output: string} | null, error?: Error) => void,
  ) {
    const torrentService = services?.torrentService;

    if (torrentService == null) {
      callback(null, Error('Torrent service is not initialized'));
      return;
    }

    if (hash == null) {
      callback(null, Error('Hash must be defined'));
      return;
    }

    const selectedTorrent = torrentService.getTorrent(hash);
    try {
      childProcess.execFile(
        'mediainfo',
        [selectedTorrent.basePath],
        {maxBuffer: 1024 * 2000},
        (error, stdout, stderr) => {
          if (error) {
            callback(null, error);
            return;
          }

          if (stderr) {
            callback(null, Error(stderr));
            return;
          }

          callback({output: stdout});
        },
      );
    } catch (childProcessError) {
      callback(null, Error(childProcessError));
    }
  },
};
