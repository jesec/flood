// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import geoip from 'geoip-country';
import truncateTo from './numberUtils';
import torrentFilePropsMap from '../../shared/constants/torrentFilePropsMap';
import torrentPeerPropsMap from '../../shared/constants/torrentPeerPropsMap';
import torrentTrackerPropsMap from '../../shared/constants/torrentTrackerPropsMap';

import type {TorrentFile, TorrentFileRPCResponse} from '../../shared/constants/torrentFilePropsMap';
import type {TorrentPeer, TorrentPeerRPCResponse} from '../../shared/constants/torrentPeerPropsMap';

interface FileTree {
  directories?: Record<string, FileTree>;
  files?: Array<TorrentFile>;
}

const processFile = (response: TorrentFileRPCResponse): TorrentFile => {
  return {
    index: response.index,
    filename: response.pathComponents[response.pathComponents.length - 1],
    path: response.path,
    percentComplete: truncateTo((response.completedChunks / response.sizeChunks) * 100),
    priority: response.priority,
    sizeBytes: response.sizeBytes,
  };
};

const getFileTreeFromPathsArr = (tree: FileTree | null, directory: string, file: TorrentFileRPCResponse, depth = 0) => {
  if (tree == null) {
    return {};
  }

  if (depth++ < file.pathComponents.length - 1) {
    if (!tree.directories) {
      tree.directories = {};
    }

    tree.directories[directory] = getFileTreeFromPathsArr(
      tree.directories[directory],
      file.pathComponents[depth],
      file,
      depth,
    );
  } else {
    if (!tree.files) {
      tree.files = [];
    }

    tree.files.push(processFile(file));
  }

  return tree;
};

const mapPropsToResponse = (requestedKeys: Array<string>, clientResponse: Array<Array<string>>) => {
  if (clientResponse.length === 0) {
    return [];
  }

  // The nested arrays represent one of many items of the same type (e.g. a
  // list of peers, files, trackers). Therefore we construct an array of
  // objects, where each object contains all of the requested keys and its
  // value. We add an index for each item, a requirement for file lists.
  return clientResponse.map(
    (listItem, index) =>
      listItem.reduce(
        (nestedMemo: Record<string, object | number | string>, value, nestedIndex) => {
          nestedMemo[requestedKeys[nestedIndex]] = value;

          return nestedMemo;
        },
        {index},
      ),
    [],
  );
};

export const processTorrentDetails = (data: string[][][][]) => {
  // TODO: This is ugly.
  const peersData = data[0][0] || null;
  const filesData = data[1][0] || null;
  const trackerData = data[2][0] || null;
  let peers = null;
  let files = null;
  let trackers = null;
  let fileTree = {};

  if (peersData && peersData.length) {
    peers = mapPropsToResponse(torrentPeerPropsMap.props, peersData).map(
      (peer: unknown): TorrentPeer => {
        const response = peer as TorrentPeerRPCResponse;

        return {
          address: response.address,
          completedPercent: response.completedPercent,
          clientVersion: response.clientVersion,
          downloadRate: response.downloadRate,
          downloadTotal: response.downloadTotal,
          uploadRate: response.uploadRate,
          uploadTotal: response.uploadTotal,
          id: response.id,
          peerRate: response.peerRate,
          peerTotal: response.peerTotal,
          isEncrypted: response.isEncrypted === '1',
          isIncoming: response.isIncoming === '1',
          country: geoip.lookup(response.address).country || '',
        };
      },
    );
  }

  if (filesData && filesData.length) {
    files = mapPropsToResponse(torrentFilePropsMap.props, filesData);
    fileTree = files.reduce((memo: unknown, file: unknown) => {
      const tree = memo as FileTree;
      const response = file as TorrentFileRPCResponse;
      return getFileTreeFromPathsArr(tree, response.pathComponents[0], response);
    }, {});
  }

  if (trackerData && trackerData.length) {
    trackers = mapPropsToResponse(torrentTrackerPropsMap.props, trackerData);
  }

  return {peers, trackers, fileTree};
};
