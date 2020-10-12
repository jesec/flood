import axios from 'axios';
import download from 'js-file-download';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CheckTorrentsOptions,
  CreateTorrentOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsTagsOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';
import type {TorrentProperties} from '@shared/types/Torrent';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

const TorrentActions = {
  addTorrentsByUrls: (options: AddTorrentByURLOptions) =>
    axios
      .post(`${baseURI}api/torrents/add-urls`, options)
      .then((json) => json.data)
      .then(
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_ADD_TORRENT_SUCCESS',
            data: {
              count: options.urls.length,
              start: options.start,
              destination: options.destination,
              response,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_ADD_TORRENT_ERROR',
            data: {
              error,
            },
          });
        },
      ),

  addTorrentsByFiles: (options: AddTorrentByFileOptions) =>
    axios
      .post(`${baseURI}api/torrents/add-files`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_ADD_TORRENT_SUCCESS',
            data: {
              count: options.files.length,
              start: options.start,
              destination: options.destination,
              data,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_ADD_TORRENT_ERROR',
            data: {
              error,
            },
          });
        },
      ),

  createTorrent: (options: CreateTorrentOptions) =>
    axios.post(`${baseURI}api/torrents/create`, options, {responseType: 'blob'}).then(
      (response) => {
        AppDispatcher.dispatchServerAction({
          type: 'CLIENT_ADD_TORRENT_SUCCESS',
          data: {
            count: 1,
          },
        });
        download(response.data, (options.name || `${Date.now()}`).concat('.torrent'));
      },
      () => {
        AppDispatcher.dispatchServerAction({
          type: 'CLIENT_ADD_TORRENT_ERROR',
        });
      },
    ),

  deleteTorrents: (options: DeleteTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/delete`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_REMOVE_TORRENT_SUCCESS',
            data: {
              data,
              count: options.hashes.length,
              deleteData: options.deleteData || false,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_REMOVE_TORRENT_ERROR',
            error: {
              error,
              count: options.hashes.length,
            },
          });
        },
      ),

  checkHash: (options: CheckTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/check-hash`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_CHECK_HASH_SUCCESS',
            data: {
              data,
              count: options.hashes.length,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_CHECK_HASH_ERROR',
            error: {
              error,
              count: options.hashes.length,
            },
          });
        },
      ),

  fetchMediainfo: (hash: TorrentProperties['hash']) =>
    axios
      .get(`${baseURI}api/torrents/${hash}/mediainfo`)
      .then((json) => json.data)
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: 'CLIENT_FETCH_TORRENT_MEDIAINFO_SUCCESS',
          data: {
            ...response,
            hash,
          },
        });
      }),

  fetchTorrentDetails: (hash: TorrentProperties['hash']) =>
    axios
      .get(`${baseURI}api/torrents/${hash}/details`)
      .then((json) => json.data)
      .then(
        (torrentDetails) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_FETCH_TORRENT_DETAILS_SUCCESS',
            data: {
              hash,
              torrentDetails,
            },
          });
        },
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_FETCH_TORRENT_DETAILS_ERROR',
            data: {
              hash,
            },
          });
        },
      ),

  moveTorrents: (options: MoveTorrentsOptions) => {
    return axios
      .post(`${baseURI}api/torrents/move`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_MOVE_TORRENTS_SUCCESS',
            data: {
              data,
              count: options.hashes.length,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_MOVE_TORRENTS_ERROR',
            error: {
              error,
              count: options.hashes.length,
            },
          });
        },
      );
  },

  startTorrents: (options: StartTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/start`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_START_TORRENT_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_START_TORRENT_ERROR',
            error,
          });
        },
      ),

  stopTorrents: (options: StopTorrentsOptions) =>
    axios
      .post(`${baseURI}api/torrents/stop`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_STOP_TORRENT_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_STOP_TORRENT_ERROR',
            error,
          });
        },
      ),

  setPriority: (options: SetTorrentsPriorityOptions) =>
    axios
      .patch(`${baseURI}api/torrents/priority`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_TORRENT_PRIORITY_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_TORRENT_PRIORITY_ERROR',
            error,
          });
        },
      ),

  setFilePriority: (hash: TorrentProperties['hash'], options: SetTorrentContentsPropertiesOptions) =>
    axios
      .patch(`${baseURI}api/torrents/${hash}/contents`, options)
      .then((json) => json.data)
      .then(
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_FILE_PRIORITY_SUCCESS',
            data: {
              hash,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_FILE_PRIORITY_ERROR',
            error,
          });
        },
      ),

  setTags: (options: SetTorrentsTagsOptions) =>
    axios
      .patch(`${baseURI}api/torrents/tags`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_TAXONOMY_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_TAXONOMY_ERROR',
            error,
          });
        },
      ),

  setTracker: (hashes: Array<TorrentProperties['hash']>, tracker: string, options = {}) =>
    axios
      .patch(`${baseURI}api/torrents/tracker`, {
        hashes,
        tracker,
        options,
      })
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_TRACKER_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_TRACKER_ERROR',
            error,
          });
        },
      ),
};

export default TorrentActions;
