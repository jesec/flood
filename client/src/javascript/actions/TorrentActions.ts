import axios, {CancelToken} from 'axios';
import download from 'js-file-download';

import type {AddTorrentByFileOptions, AddTorrentByURLOptions} from '@shared/schema/api/torrents';
import type {
  CheckTorrentsOptions,
  CreateTorrentOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsTagsOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TorrentProperties} from '@shared/types/Torrent';

import AlertStore from '../stores/AlertStore';
import ConfigStore from '../stores/ConfigStore';
import UIStore from '../stores/UIStore';

const {baseURI} = ConfigStore;

const emitTorrentAddedAlert = (count: number) => {
  AlertStore.add({
    id: 'alert.torrent.add',
    type: 'success',
    count,
  });
};

const TorrentActions = {
  addTorrentsByUrls: (options: AddTorrentByURLOptions) =>
    axios
      .post(`${baseURI}api/torrents/add-urls`, options)
      .then((json) => json.data)
      .then(
        () => {
          emitTorrentAddedAlert(options.urls.length);
        },
        () => {
          // do nothing.
        },
      ),

  addTorrentsByFiles: (options: AddTorrentByFileOptions) =>
    axios
      .post(`${baseURI}api/torrents/add-files`, options)
      .then((json) => json.data)
      .then(
        () => {
          emitTorrentAddedAlert(options.files.length);
        },
        () => {
          // do nothing.
        },
      ),

  createTorrent: (options: CreateTorrentOptions) =>
    axios.post(`${baseURI}api/torrents/create`, options, {responseType: 'blob'}).then(
      (response) => {
        download(response.data, (options.name || `${Date.now()}`).concat('.torrent'));
        emitTorrentAddedAlert(1);
      },
      () => {
        // do nothing.
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
        (contents) => {
          return contents;
        },
        () => {
          return null;
        },
      ),

  fetchTorrentPeers: (hash: TorrentProperties['hash']): Promise<Array<TorrentPeer> | null> =>
    axios
      .get(`${baseURI}api/torrents/${hash}/peers`)
      .then<Array<TorrentPeer>>((json) => json.data)
      .then(
        (peers) => {
          return peers;
        },
        () => {
          return null;
        },
      ),

  fetchTorrentTrackers: (hash: TorrentProperties['hash']): Promise<Array<TorrentTracker> | null> =>
    axios
      .get(`${baseURI}api/torrents/${hash}/trackers`)
      .then<Array<TorrentTracker>>((json) => json.data)
      .then(
        (trackers) => {
          return trackers;
        },
        () => {
          return null;
        },
      ),

  moveTorrents: (options: MoveTorrentsOptions) => {
    return axios
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
      );
  },

  startTorrents: (options: StartTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/start`, options)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  stopTorrents: (options: StopTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/stop`, options)
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
