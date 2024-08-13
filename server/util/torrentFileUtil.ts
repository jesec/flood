import fs from 'node:fs';
import path from 'node:path';

import bencode from 'bencode';

import type {LibTorrentResume, RTorrentFile, TorrentFile} from '../../shared/types/TorrentFile';
import {LibTorrentFilePriority} from '../../shared/types/TorrentFile';

const openAndDecodeTorrent = async (torrentPath: string): Promise<TorrentFile | null> => {
  let torrentData: TorrentFile | null = null;

  try {
    torrentData = bencode.decode(await fs.promises.readFile(torrentPath));
  } catch {
    return null;
  }

  if (torrentData == null) {
    return null;
  }

  return torrentData;
};

export const getComment = async (torrent: Buffer): Promise<string | undefined> => {
  const torrentData: TorrentFile | null = await bencode.decode(torrent);

  if (torrentData == null) {
    return;
  }

  return torrentData.comment?.toString();
};

export const getContentSize = async (info: TorrentFile['info']): Promise<number> => {
  if (info.length != null) {
    // Single file torrent
    return info.length;
  }

  if (info.files != null) {
    // Multi file torrent
    let totalLength = 0;
    info.files.forEach(({length}) => {
      totalLength += length;
    });
    return totalLength;
  }

  // Things are not right
  return 0;
};

export const setTrackers = async (torrent: string, trackers: Array<string>): Promise<boolean> => {
  const torrentData = await openAndDecodeTorrent(torrent);

  if (torrentData == null) {
    return false;
  }

  if (trackers.length > 1 || torrentData['announce-list'] != null) {
    torrentData['announce-list'] = [];
    torrentData['announce-list'].push(
      trackers.map((tracker) => {
        return Buffer.from(tracker);
      }),
    );
  }

  if (trackers.length == 1 || torrentData['announce'] != null) {
    torrentData['announce'] = Buffer.from(trackers[0]);
  }

  try {
    await fs.promises.writeFile(torrent, bencode.encode(torrentData));
  } catch {
    return false;
  }

  return true;
};

export const setCompleted = async (torrent: Buffer, destination: string, isBasePath = true): Promise<Buffer | null> => {
  const torrentData: TorrentFile | null = await bencode.decode(torrent);

  if (torrentData == null) {
    return null;
  }

  const {info} = torrentData;
  if (info == null) {
    return null;
  }

  const contentSize = await getContentSize(info);
  const pieceSize = Number(info['piece length']);
  if (contentSize === 0 || pieceSize == null || pieceSize === 0) {
    return null;
  }

  const contentPathsWithLengths: Array<[string, number]> = [];

  if (info.length != null) {
    // Single file torrent
    contentPathsWithLengths.push([path.resolve(path.join(destination, info.name.toString())), info.length]);
  } else if (info.files != null) {
    // Multi file torrent
    const basePath = isBasePath ? destination : path.join(destination, info.name.toString());
    info.files.forEach((content) => {
      contentPathsWithLengths.push([
        path.resolve(path.join(basePath, content.path.map((pathBuffer) => pathBuffer.toString()).join('/'))),
        content.length,
      ]);
    });
  } else {
    return null;
  }

  const completedFileResumeTree: LibTorrentResume['files'] = await Promise.all(
    contentPathsWithLengths.map(async (contentPathWithLength) => {
      const [contentPath, contentLength] = contentPathWithLength;

      try {
        const fileStat = await fs.promises.lstat(contentPath);

        if (!fileStat.isFile() || fileStat.size !== contentLength) {
          return {
            completed: 0,
            mtime: 0,
            priority: LibTorrentFilePriority.OFF,
          };
        }

        return {
          completed: Math.ceil(contentLength / pieceSize),
          mtime: Math.trunc(fileStat.mtimeMs / 1000),
          priority: LibTorrentFilePriority.OFF,
        };
      } catch {
        return {
          completed: 0,
          mtime: 0,
          priority: LibTorrentFilePriority.NORMAL,
        };
      }
    }),
  );

  const completedResume: LibTorrentResume = {
    bitfield: Math.ceil(contentSize / pieceSize),
    files: completedFileResumeTree,
  };

  const torrentDataWithResume: RTorrentFile = Object.assign(torrentData, {
    libtorrent_resume: completedResume,
  });

  try {
    return bencode.encode(torrentDataWithResume);
  } catch {
    return null;
  }
};
