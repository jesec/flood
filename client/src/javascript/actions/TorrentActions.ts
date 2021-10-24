import axios, {CancelToken} from 'axios';
import download from 'js-file-download';

import AlertStore from '@client/stores/AlertStore';
import ConfigStore from '@client/stores/ConfigStore';
import UIStore from '@client/stores/UIStore';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import {
  CheckTorrentsOptions,
  CreateTorrentOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsInitialSeedingOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsSequentialOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
  TorrentAddResponse,
  TorrentMediainfoResponse,
} from '@shared/types/api/torrents';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TorrentProperties} from '@shared/types/Torrent';

const {baseURI} = ConfigStore;

const emitRequestSentAlert = (count: number) => {
  AlertStore.add({
    id: 'alert.torrent.add.sent',
    count,
  });
};

const emitTorrentAddedAlert = (count: number) => {
  AlertStore.add({
    id: 'alert.torrent.add',
    type: 'success',
    count,
  });
};

const emitFailedToAddTorrentAlert = (count: number) => {
  AlertStore.add({
    id: 'alert.torrent.add.failed',
    type: 'error',
    count,
  });
};

const TorrentActions = {
  addTorrentsByUrls: (options: AddTorrentByURLOptions): Promise<void> =>
    axios.post<TorrentAddResponse>(`${baseURI}api/torrents/add-urls`, options).then(
      ({data}) => {
        if (data.length) {
          emitTorrentAddedAlert(data.length);
        } else {
          emitRequestSentAlert(options.urls.length);
        }
      },
      () => {
        emitFailedToAddTorrentAlert(options.urls.length);
      },
    ),

  addTorrentsByFiles: (options: AddTorrentByFileOptions): Promise<void> =>
    axios.post<TorrentAddResponse>(`${baseURI}api/torrents/add-files`, options).then(
      ({data}) => {
        if (data.length) {
          emitTorrentAddedAlert(data.length);
        } else {
          emitRequestSentAlert(options.files.length);
        }
      },
      () => {
        emitFailedToAddTorrentAlert(options.files.length);
      },
    ),

  createTorrent: (options: CreateTorrentOptions): Promise<void> =>
    axios.post<Blob>(`${baseURI}api/torrents/create`, options, {responseType: 'blob'}).then(
      ({data}) => {
        download(data, (options.name || `${Date.now()}`).concat('.torrent'));
        emitTorrentAddedAlert(1);
      },
      () => {
        emitFailedToAddTorrentAlert(1);
      },
    ),

  deleteTorrents: (options: DeleteTorrentsOptions): Promise<void> =>
    axios.post(`${baseURI}api/torrents/delete`, options).then(
      () =>
        AlertStore.add({
          id: 'alert.torrent.remove',
          type: 'success',
          count: options.hashes.length,
        }),
      () =>
        AlertStore.add({
          id: 'alert.torrent.remove.failed',
          type: 'error',
          count: options.hashes.length,
        }),
    ),

  checkHash: (options: CheckTorrentsOptions): Promise<void> =>
    axios.post(`${baseURI}api/torrents/check-hash`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  fetchMediainfo: (hash: TorrentProperties['hash'], cancelToken?: CancelToken): Promise<{output: string}> =>
    axios
      .get<TorrentMediainfoResponse>(`${baseURI}api/torrents/${hash}/mediainfo`, {cancelToken})
      .then<{output: string}>((res) => res.data),

  fetchTorrentContents: (hash: TorrentProperties['hash']): Promise<Array<TorrentContent> | null> =>
    axios.get<Array<TorrentContent>>(`${baseURI}api/torrents/${hash}/contents`).then(
      (res) => res.data,
      () => null,
    ),

  fetchTorrentPeers: (hash: TorrentProperties['hash']): Promise<Array<TorrentPeer> | null> =>
    axios.get<Array<TorrentPeer>>(`${baseURI}api/torrents/${hash}/peers`).then(
      (res) => res.data,
      () => null,
    ),

  fetchTorrentTrackers: (hash: TorrentProperties['hash']): Promise<Array<TorrentTracker> | null> =>
    axios.get<Array<TorrentTracker>>(`${baseURI}api/torrents/${hash}/trackers`).then(
      (res) => res.data,
      () => null,
    ),

  getTorrentContentsDataPermalink: (hash: TorrentProperties['hash'], indices: number[]): Promise<string> =>
    axios
      .get(`${ConfigStore.baseURI}api/torrents/${hash}/contents/${indices.join(',')}/token`)
      .then(
        (res) =>
          `${window.location.protocol}//${window.location.host}${
            ConfigStore.baseURI
          }api/torrents/${hash}/contents/${indices.join(',')}/data?token=${res.data}`,
      ),

  moveTorrents: (options: MoveTorrentsOptions): Promise<void> =>
    axios.post(`${baseURI}api/torrents/move`, options).then(
      () =>
        AlertStore.add({
          id: 'alert.torrent.move',
          type: 'success',
          count: options.hashes.length,
        }),
      () =>
        AlertStore.add({
          id: 'alert.torrent.move.failed',
          type: 'error',
          count: options.hashes.length,
        }),
    ),

  reannounce: (options: ReannounceTorrentsOptions): Promise<void> =>
    axios.post(`${baseURI}api/torrents/reannounce`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  startTorrents: async (options: StartTorrentsOptions): Promise<void> => {
    if (options.hashes.length > 0) {
      return axios.post(`${baseURI}api/torrents/start`, options).then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      );
    }
    return undefined;
  },

  stopTorrents: async (options: StopTorrentsOptions): Promise<void> => {
    if (options.hashes.length > 0) {
      return axios.post(`${baseURI}api/torrents/stop`, options).then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      );
    }
    return undefined;
  },

  setInitialSeeding: (options: SetTorrentsInitialSeedingOptions): Promise<void> =>
    axios.patch(`${baseURI}api/torrents/initial-seeding`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  setPriority: (options: SetTorrentsPriorityOptions): Promise<void> =>
    axios.patch(`${baseURI}api/torrents/priority`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  setSequential: (options: SetTorrentsSequentialOptions): Promise<void> =>
    axios.patch(`${baseURI}api/torrents/sequential`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  setFilePriority: (hash: TorrentProperties['hash'], options: SetTorrentContentsPropertiesOptions): Promise<void> =>
    axios.patch(`${baseURI}api/torrents/${hash}/contents`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  setTags: (options: SetTorrentsTagsOptions): Promise<void> =>
    axios.patch(`${baseURI}api/torrents/tags`, options).then(
      () => UIStore.handleSetTaxonomySuccess(),
      () => {
        // do nothing.
      },
    ),

  setTrackers: (options: SetTorrentsTrackersOptions): Promise<void> =>
    axios.patch(`${baseURI}api/torrents/trackers`, options).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),
};

export default TorrentActions;
