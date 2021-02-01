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
import type {
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
  addTorrentsByUrls: (options: AddTorrentByURLOptions) =>
    axios
      .post(`${baseURI}api/torrents/add-urls`, options)
      .then((json) => json.data)
      .then(
        (response) => {
          if (response.length) {
            emitTorrentAddedAlert(response.length);
          } else {
            emitRequestSentAlert(options.urls.length);
          }
        },
        () => {
          emitFailedToAddTorrentAlert(options.urls.length);
        },
      ),

  addTorrentsByFiles: (options: AddTorrentByFileOptions) =>
    axios
      .post(`${baseURI}api/torrents/add-files`, options)
      .then((json) => json.data)
      .then(
        (response) => {
          if (response.length) {
            emitTorrentAddedAlert(response.length);
          } else {
            emitRequestSentAlert(options.files.length);
          }
        },
        () => {
          emitFailedToAddTorrentAlert(options.files.length);
        },
      ),

  createTorrent: (options: CreateTorrentOptions) =>
    axios.post(`${baseURI}api/torrents/create`, options, {responseType: 'blob'}).then(
      (response) => {
        download(response.data, (options.name || `${Date.now()}`).concat('.torrent'));
        emitTorrentAddedAlert(1);
      },
      () => {
        emitFailedToAddTorrentAlert(1);
      },
    ),

  deleteTorrents: (options: DeleteTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/delete`, options)
      .then((json) => json.data)
      .then(
        () => {
          AlertStore.add({
            id: 'alert.torrent.remove',
            type: 'success',
            count: options.hashes.length,
          });
        },
        () => {
          AlertStore.add({
            id: 'alert.torrent.remove.failed',
            type: 'error',
            count: options.hashes.length,
          });
        },
      ),

  checkHash: (options: CheckTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/check-hash`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  fetchMediainfo: (hash: TorrentProperties['hash'], cancelToken?: CancelToken): Promise<{output: string}> =>
    axios.get(`${baseURI}api/torrents/${hash}/mediainfo`, {cancelToken}).then<{output: string}>((json) => json.data),

  fetchTorrentContents: (hash: TorrentProperties['hash']): Promise<Array<TorrentContent> | null> =>
    axios
      .get(`${baseURI}api/torrents/${hash}/contents`)
      .then<Array<TorrentContent>>((json) => json.data)
      .then(
        (contents) => contents,
        () => null,
      ),

  fetchTorrentPeers: (hash: TorrentProperties['hash']): Promise<Array<TorrentPeer> | null> =>
    axios
      .get(`${baseURI}api/torrents/${hash}/peers`)
      .then<Array<TorrentPeer>>((json) => json.data)
      .then(
        (peers) => peers,
        () => null,
      ),

  fetchTorrentTrackers: (hash: TorrentProperties['hash']): Promise<Array<TorrentTracker> | null> =>
    axios
      .get(`${baseURI}api/torrents/${hash}/trackers`)
      .then<Array<TorrentTracker>>((json) => json.data)
      .then(
        (trackers) => trackers,
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

  getTorrentContentsSubtitlePermalink: (hash: TorrentProperties['hash'], index: number) =>
    axios
      .get(`${ConfigStore.baseURI}api/torrents/${hash}/contents/${index}/token`)
      .then(
        (res) =>
          `${window.location.protocol}//${window.location.host}${ConfigStore.baseURI}api/torrents/${hash}/contents/${index}/subtitles?token=${res.data}`,
      ),

  moveTorrents: (options: MoveTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/move`, options)
      .then((json) => json.data)
      .then(
        () => {
          AlertStore.add({
            id: 'alert.torrent.move',
            type: 'success',
            count: options.hashes.length,
          });
        },
        () => {
          AlertStore.add({
            id: 'alert.torrent.move.failed',
            type: 'error',
            count: options.hashes.length,
          });
        },
      ),

  reannounce: (options: ReannounceTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/reannounce`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  startTorrents: async (options: StartTorrentsOptions): Promise<void> => {
    if (options.hashes.length > 0) {
      return axios
        .post(`${baseURI}api/torrents/start`, options)
        .then((json) => json.data)
        .then(
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
      return axios
        .post(`${baseURI}api/torrents/stop`, options)
        .then((json) => json.data)
        .then(
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

  setInitialSeeding: (options: SetTorrentsInitialSeedingOptions) =>
    axios
      .patch(`${baseURI}api/torrents/initial-seeding`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  setPriority: (options: SetTorrentsPriorityOptions) =>
    axios
      .patch(`${baseURI}api/torrents/priority`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  setSequential: (options: SetTorrentsSequentialOptions) =>
    axios
      .patch(`${baseURI}api/torrents/sequential`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  setFilePriority: (hash: TorrentProperties['hash'], options: SetTorrentContentsPropertiesOptions) =>
    axios
      .patch(`${baseURI}api/torrents/${hash}/contents`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  setTags: (options: SetTorrentsTagsOptions) =>
    axios
      .patch(`${baseURI}api/torrents/tags`, options)
      .then((json) => json.data)
      .then(
        () => {
          UIStore.handleSetTaxonomySuccess();
        },
        () => {
          // do nothing.
        },
      ),

  setTrackers: (options: SetTorrentsTrackersOptions) =>
    axios
      .patch(`${baseURI}api/torrents/trackers`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),
};

export default TorrentActions;
