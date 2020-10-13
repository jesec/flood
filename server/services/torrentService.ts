import {deepEqual} from 'fast-equals';

import type {TorrentProperties, TorrentListDiff, TorrentListSummary} from '@shared/types/Torrent';

import BaseService from './BaseService';
import config from '../../config';
import hasTorrentFinished from '../util/torrentPropertiesUtil';

interface TorrentServiceEvents {
  FETCH_TORRENT_LIST_SUCCESS: () => void;
  FETCH_TORRENT_LIST_ERROR: () => void;
  TORRENT_LIST_DIFF_CHANGE: (payload: {id: number; diff: TorrentListDiff}) => void;
  newListener: (event: keyof Omit<TorrentServiceEvents, 'newListener' | 'removeListener'>) => void;
  removeListener: (event: keyof Omit<TorrentServiceEvents, 'newListener' | 'removeListener'>) => void;
}

class TorrentService extends BaseService<TorrentServiceEvents> {
  errorCount = 0;
  pollEnabled = false;
  pollTimeout: NodeJS.Timeout | null = null;
  torrentListSummary: TorrentListSummary = {id: Date.now(), torrents: {}};

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.fetchTorrentList = this.fetchTorrentList.bind(this);
    this.handleTorrentProcessed = this.handleTorrentProcessed.bind(this);
    this.handleFetchTorrentListSuccess = this.handleFetchTorrentListSuccess.bind(this);
    this.handleFetchTorrentListError = this.handleFetchTorrentListError.bind(this);

    this.onServicesUpdated = () => {
      if (this.services == null || this.services.clientGatewayService == null) {
        return;
      }

      const {clientGatewayService} = this.services;

      clientGatewayService.on('PROCESS_TORRENT', this.handleTorrentProcessed);

      this.fetchTorrentList();

      // starts polling when the first streaming listener is added
      this.on('newListener', (event) => {
        if (!this.pollEnabled && event === 'TORRENT_LIST_DIFF_CHANGE') {
          this.pollEnabled = true;
          this.deferFetchTorrentList();
        }
      });

      // stops polling when the last streaming listener is removed
      this.on('removeListener', (event) => {
        if (event === 'TORRENT_LIST_DIFF_CHANGE' && this.listenerCount('TORRENT_LIST_DIFF_CHANGE') === 0) {
          this.pollEnabled = false;
        }
      });
    };
  }

  assignDeletedTorrentsToDiff(
    diff: TorrentListDiff,
    nextTorrentListSummary: this['torrentListSummary'],
    newTorrentCount: number,
  ): TorrentListDiff {
    const prevTorrentCount = Object.keys(this.torrentListSummary.torrents).length;
    const nextTorrentCount = Object.keys(nextTorrentListSummary.torrents).length;

    // We need to look for deleted torrents in two scenarios:
    // 1. the next list length is less than than the current length
    // 2. at least one new torrent was added and the next list length is
    //    equal to or greater than the current list length.
    //
    // We definitely don't need to look for deleted torrents if the number
    // of new torrents is equal to the difference between next torrent list
    // length and previous torrent list length.
    let shouldLookForDeletedTorrents = nextTorrentCount < prevTorrentCount;

    if (newTorrentCount > 0) {
      if (nextTorrentCount >= prevTorrentCount) {
        shouldLookForDeletedTorrents = true;
      }

      if (newTorrentCount === nextTorrentCount - prevTorrentCount) {
        shouldLookForDeletedTorrents = false;
      }
    }

    let diffWithDeleted = diff;

    if (shouldLookForDeletedTorrents) {
      Object.keys(this.torrentListSummary.torrents).forEach((hash) => {
        if (nextTorrentListSummary.torrents[hash] == null) {
          diffWithDeleted = Object.assign(diffWithDeleted, {
            [hash]: {
              action: 'TORRENT_LIST_ACTION_TORRENT_DELETED',
            },
          });
        }
      }, {});
    }

    return diffWithDeleted;
  }

  deferFetchTorrentList(interval = config.torrentClientPollInterval || 2000) {
    if (this.pollEnabled) {
      this.pollTimeout = setTimeout(this.fetchTorrentList, interval);
    }
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

  getTorrentListDiff(nextTorrentListSummary: this['torrentListSummary']) {
    let newTorrentCount = 0;

    // Get the diff...
    const diff = Object.keys(nextTorrentListSummary.torrents).reduce((accumulator, hash) => {
      const currentTorrentProperties = this.torrentListSummary.torrents[hash];
      const nextTorrentProperties = nextTorrentListSummary.torrents[hash];

      // If the current torrent list doesn't contain any details for this
      // hash, then it's a brand new torrent, so every detail is part of the
      // diff.
      if (currentTorrentProperties == null) {
        accumulator[hash] = {
          action: 'TORRENT_LIST_ACTION_TORRENT_ADDED',
          data: nextTorrentProperties,
        };

        // Track the number of new torrents added.
        newTorrentCount += 1;
      } else {
        let changed = false;
        let changedProperties: Partial<TorrentProperties> = {};

        Object.keys(nextTorrentProperties).forEach((key) => {
          const property = key as keyof TorrentProperties;
          // If one of the details is unequal, we need to add it to the diff.
          if (!deepEqual(currentTorrentProperties[property], nextTorrentProperties[property])) {
            // Add the diff details.
            changed = true;
            changedProperties = {
              ...changedProperties,
              [property]: nextTorrentProperties[property],
            };
          }
        });

        if (changed) {
          accumulator[hash] = {
            action: 'TORRENT_LIST_ACTION_TORRENT_DETAIL_UPDATED',
            data: changedProperties,
          };
        }
      }

      return accumulator;
    }, {} as TorrentListDiff);

    return this.assignDeletedTorrentsToDiff(diff, nextTorrentListSummary, newTorrentCount);
  }

  getTorrentListSummary() {
    return this.torrentListSummary;
  }

  handleFetchTorrentListError() {
    let nextInterval = config.torrentClientPollInterval || 2000;

    // If more than 2 consecutive errors have occurred, then we delay the next request.
    this.errorCount += 1;
    if (this.errorCount > 2) {
      nextInterval = Math.min(nextInterval + 2 ** this.errorCount, 1000 * 60);
    }

    this.deferFetchTorrentList(nextInterval);

    this.emit('FETCH_TORRENT_LIST_ERROR');
    return null;
  }

  handleFetchTorrentListSuccess(nextTorrentListSummary: this['torrentListSummary']) {
    const diff = this.getTorrentListDiff(nextTorrentListSummary);
    if (Object.keys(diff).length > 0) {
      this.emit('TORRENT_LIST_DIFF_CHANGE', {diff, id: nextTorrentListSummary.id});
    }

    this.torrentListSummary = nextTorrentListSummary;

    this.deferFetchTorrentList();

    this.errorCount = 0;
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
