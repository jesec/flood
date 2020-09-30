import axios from 'axios';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/Action';
import type {TorrentProperties} from '@shared/types/Torrent';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

const TorrentActions = {
  addTorrentsByUrls: (options: AddTorrentByURLOptions) =>
    axios
      .post(`${baseURI}api/torrents/add`, options)
      .then((json) => json.data)
      .then(
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_ADD_TORRENT_SUCCESS',
            data: {
              count: options.urls.length,
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

  setPriority: (hash: TorrentProperties['hash'], priority: number) =>
    axios
      .patch(`${baseURI}api/torrents/${hash}/priority`, {
        hash,
        priority,
      })
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

  setFilePriority: (hash: TorrentProperties['hash'], indices: Array<number>, priority: number) =>
    axios
      .patch(`${baseURI}api/torrents/${hash}/contents`, {
        indices,
        priority,
      })
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

  setTaxonomy: (hashes: Array<TorrentProperties['hash']>, tags: Array<string>, options = {}) =>
    axios
      .patch(`${baseURI}api/torrents/taxonomy`, {
        hashes,
        tags,
        options,
      })
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
