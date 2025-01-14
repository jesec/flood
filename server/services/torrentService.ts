import type {TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import jsonpatch, {Operation} from 'fast-json-patch';

import config from '../../config';
import {hasTorrentFinished} from '../util/torrentPropertiesUtil';
import BaseService from './BaseService';

type TorrentServiceEvents = {
  FETCH_TORRENT_LIST_SUCCESS: () => void;
  FETCH_TORRENT_LIST_ERROR: () => void;
  TORRENT_LIST_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
  newListener: (event: keyof Omit<TorrentServiceEvents, 'newListener' | 'removeListener'>) => void;
  removeListener: (event: keyof Omit<TorrentServiceEvents, 'newListener' | 'removeListener'>) => void;
};

class TorrentService extends BaseService<TorrentServiceEvents> {
  pollInterval = config.torrentClientPollIntervalIdle;
  pollTimeout: NodeJS.Timeout | null = null;
  torrentListSummary: TorrentListSummary = {id: Date.now(), torrents: {}};

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

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
    this.pollTimeout = setTimeout(this.fetchTorrentList, this.pollInterval);
  }

  destroy(drop: boolean) {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    return super.destroy(drop);
  }

  fetchTorrentList = () => {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    return (
      this.services?.clientGatewayService
        ?.fetchTorrentList()
        .then(this.handleFetchTorrentListSuccess)
        .catch(this.handleFetchTorrentListError) || Promise.resolve(this.handleFetchTorrentListError())
    );
  };

  getTorrent(hash: TorrentProperties['hash']) {
    return this.torrentListSummary.torrents[hash.toUpperCase()];
  }

  getTorrentList() {
    return this.torrentListSummary.torrents;
  }

  getTorrentListSummary() {
    return this.torrentListSummary;
  }

  handleFetchTorrentListError = () => {
    this.deferFetchTorrentList();

    this.emit('FETCH_TORRENT_LIST_ERROR');
    return null;
  };

  handleFetchTorrentListSuccess = (nextTorrentListSummary: this['torrentListSummary']) => {
    const diff = jsonpatch.compare(this.torrentListSummary.torrents, nextTorrentListSummary.torrents);
    if (diff.length > 0) {
      this.emit('TORRENT_LIST_DIFF_CHANGE', {
        diff,
        id: nextTorrentListSummary.id,
      });
    }

    this.torrentListSummary = nextTorrentListSummary;

    this.deferFetchTorrentList();

    this.emit('FETCH_TORRENT_LIST_SUCCESS');
    return this.torrentListSummary;
  };

  handleTorrentProcessed = (nextTorrentProperties: TorrentProperties) => {
    const prevTorrentProperties = this.torrentListSummary.torrents[nextTorrentProperties.hash];

    if (hasTorrentFinished(prevTorrentProperties, nextTorrentProperties)) {
      const {dateFinished} = nextTorrentProperties;
      this.services?.notificationService.addNotification(
        [
          {
            id: 'notification.torrent.finished',
            data: {name: nextTorrentProperties.name},
          },
        ],
        dateFinished > 0 ? dateFinished * 1000 : undefined,
      );
    }
  };
}

export default TorrentService;
