import jsonpatch, {Operation} from 'fast-json-patch';

import type {TorrentProperties, TorrentListSummary} from '@shared/types/Torrent';

import BaseService from './BaseService';
import config from '../../config';
import {hasTorrentFinished} from '../util/torrentPropertiesUtil';

interface TorrentServiceEvents {
  FETCH_TORRENT_LIST_SUCCESS: () => void;
  FETCH_TORRENT_LIST_ERROR: () => void;
  TORRENT_LIST_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
  newListener: (event: keyof Omit<TorrentServiceEvents, 'newListener' | 'removeListener'>) => void;
  removeListener: (event: keyof Omit<TorrentServiceEvents, 'newListener' | 'removeListener'>) => void;
}

class TorrentService extends BaseService<TorrentServiceEvents> {
  pollInterval = config.torrentClientPollIntervalIdle;
  pollTimeout: NodeJS.Timeout | null = null;
  torrentListSummary: TorrentListSummary = {id: Date.now(), torrents: {}};

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.fetchTorrentList = this.fetchTorrentList.bind(this);
    this.handleTorrentProcessed = this.handleTorrentProcessed.bind(this);
    this.handleFetchTorrentListSuccess = this.handleFetchTorrentListSuccess.bind(this);
    this.handleFetchTorrentListError = this.handleFetchTorrentListError.bind(this);

    this.onServicesUpdated = () => {
      if (this.services?.clientGatewayService == null) {
        return;
      }

      const {clientGatewayService} = this.services;

      clientGatewayService.on('PROCESS_TORRENT', this.handleTorrentProcessed);

      this.fetchTorrentList();

      // starts polling when the first streaming listener is added
      this.on('newListener', (event) => {
        if (event === 'TORRENT_LIST_DIFF_CHANGE') {
          if (this.pollInterval !== config.torrentClientPollInterval) {
            this.pollInterval = config.torrentClientPollInterval;
            this.deferFetchTorrentList();
          }
        }
      });

      // stops polling when the last streaming listener is removed
      this.on('removeListener', (event) => {
        if (event === 'TORRENT_LIST_DIFF_CHANGE' && this.listenerCount('TORRENT_LIST_DIFF_CHANGE') === 0) {
          this.pollInterval = config.torrentClientPollIntervalIdle;
        }
      });
    };
  }

  deferFetchTorrentList() {
    this.pollTimeout = setTimeout(this.fetchTorrentList, this.pollInterval || 2000);
  }

  destroy() {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }
  }

  fetchTorrentList() {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    return (
      this.services?.clientGatewayService
        ?.fetchTorrentList()
        .then(this.handleFetchTorrentListSuccess)
        .catch(this.handleFetchTorrentListError) || Promise.reject()
    );
  }

  getTorrent(hash: TorrentProperties['hash']) {
    return this.torrentListSummary.torrents[hash];
  }

  getTorrentList() {
    return this.torrentListSummary.torrents;
  }

  getTorrentListSummary() {
    return this.torrentListSummary;
  }

  handleFetchTorrentListError() {
    this.deferFetchTorrentList();

    this.emit('FETCH_TORRENT_LIST_ERROR');
    return null;
  }

  handleFetchTorrentListSuccess(nextTorrentListSummary: this['torrentListSummary']) {
    const diff = jsonpatch.compare(this.torrentListSummary.torrents, nextTorrentListSummary.torrents);
    if (diff.length > 0) {
      this.emit('TORRENT_LIST_DIFF_CHANGE', {diff, id: nextTorrentListSummary.id});
    }

    this.torrentListSummary = nextTorrentListSummary;

    this.deferFetchTorrentList();

    this.emit('FETCH_TORRENT_LIST_SUCCESS');
    return this.torrentListSummary;
  }

  handleTorrentProcessed(nextTorrentProperties: TorrentProperties) {
    const prevTorrentProperties = this.torrentListSummary.torrents[nextTorrentProperties.hash];

    if (hasTorrentFinished(prevTorrentProperties, nextTorrentProperties)) {
      this.services?.notificationService.addNotification([
        {
          id: 'notification.torrent.finished',
          data: {name: nextTorrentProperties.name},
        },
      ]);
    }
  }
}

export default TorrentService;
