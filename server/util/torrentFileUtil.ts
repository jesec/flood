import bencode from 'bencode';
import fs from 'fs';
import path from 'path';

import {LibTorrentFilePriority} from '../../shared/types/TorrentFile';

import type {LibTorrentResume, RTorrentFile, TorrentFile} from '../../shared/types/TorrentFile';

const openAndDecodeTorrent = async (torrentPath: string): Promise<TorrentFile | null> => {
  let torrentData: TorrentFile | null = null;

  try {
    torrentData = bencode.decode(fs.readFileSync(torrentPath));
  } catch {
    return null;
  }

  if (torrentData == null) {
    return null;
  }

  return torrentData;
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

  try {
    fs.writeFileSync(torrent, bencode.encode(torrentData));
  } catch {
    return false;
  }

  return true;
};

export const setCompleted = async (torrent: string, destination: string, isBasePath = true): Promise<boolean> => {
  const torrentData = await openAndDecodeTorrent(torrent);

  if (torrentData == null) {
    return false;
  }

  const {info} = torrentData;
  if (info == null) {
    return false;
  }

  const contentSize = await getContentSize(info);
  const pieceSize = Number(info['piece length']);
  if (contentSize === 0 || pieceSize == null || pieceSize === 0) {
    return false;
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
    return false;
  }

  const completedFileResumeTree: LibTorrentResume['files'] = contentPathsWithLengths.map((contentPathWithLength) => {
    const [contentPath, contentLength] = contentPathWithLength;

    if (!fs.existsSync(contentPath)) {
      return {
        completed: 0,
        mtime: 0,
        priority: LibTorrentFilePriority.NORMAL,
      };
    }

    const fileStat = fs.lstatSync(contentPath);
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
  });

  const completedResume: LibTorrentResume = {
    bitfield: Math.ceil(contentSize / pieceSize),
    files: completedFileResumeTree,
  };

  const torrentDataWithResume: RTorrentFile = Object.assign(torrentData, {
    libtorrent_resume: completedResume,
  });

  try {
    fs.writeFileSync(torrent, bencode.encode(torrentDataWithResume));
  } catch {
    return false;
  }

  return true;
};
