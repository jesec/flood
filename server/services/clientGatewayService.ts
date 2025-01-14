import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {UserInDatabase} from '@shared/schema/Auth';
import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {
  CheckTorrentsOptions,
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
import type {ClientSettings} from '@shared/types/ClientSettings';
import type {TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';

import config from '../../config';
import BaseService from './BaseService';

type ClientGatewayServiceEvents = {
  CLIENT_CONNECTION_STATE_CHANGE: (isConnected: boolean) => void;
  PROCESS_TORRENT_LIST_START: () => void;
  PROCESS_TORRENT_LIST_END: (torrentListSummary: TorrentListSummary) => void;
  PROCESS_TORRENT: (torrentProperties: TorrentProperties) => void;
};

abstract class ClientGatewayService extends BaseService<ClientGatewayServiceEvents> {
  errorCount = 0;
  retryTimer?: NodeJS.Timeout | null = null;

  /**
   * Adds torrents by file
   *
   * @param options - An object of options...
   * @return - Resolves with an array of hashes of added torrents or rejects with error.
   */
  abstract addTorrentsByFile(options: Required<AddTorrentByFileOptions>): Promise<string[]>;

  /**
   * Adds torrents by URL
   *
   * @param options - An object of options...
   * @return - Resolves with an array of hashes of added torrents or rejects with error.
   */
  abstract addTorrentsByURL(options: Required<AddTorrentByURLOptions>): Promise<string[]>;

  /**
   * Checks torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract checkTorrents({hashes}: CheckTorrentsOptions): Promise<void>;

  /**
   * Gets the list of contents of a torrent.
   *
   * @param hash - Hash of torrent
   * @return - Resolves with TorrentContentTree or rejects with error.
   */
  abstract getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>>;

  /**
   * Gets the list of peers of a torrent.
   *
   * @param hash - Hash of torrent
   * @return - Resolves with an array of TorrentPeer or rejects with error.
   */
  abstract getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>>;

  /**
   * Gets the list of trackers of a torrent.
   *
   * @param hash - Hash of torrent
   * @return - Resolves with an array of TorrentTracker or rejects with error.
   */
  abstract getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>>;

  /**
   * Moves torrents to specified destination path.
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract moveTorrents(options: MoveTorrentsOptions): Promise<void>;

  /**
   * Reannounces torrents to trackers
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void>;

  /**
   * Removes torrents. Optionally deletes data of torrents.
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract removeTorrents(options: DeleteTorrentsOptions): Promise<void>;

  /**
   * Sets initial seeding mode of torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract setTorrentsInitialSeeding(options: SetTorrentsInitialSeedingOptions): Promise<void>;

  /**
   * Sets priority of torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract setTorrentsPriority(options: SetTorrentsPriorityOptions): Promise<void>;

  /**
   * Sets sequential mode of torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract setTorrentsSequential(options: SetTorrentsSequentialOptions): Promise<void>;

  /**
   * Sets tags of torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract setTorrentsTags(options: SetTorrentsTagsOptions): Promise<void>;

  /**
   * Sets trackers of torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract setTorrentsTrackers(options: SetTorrentsTrackersOptions): Promise<void>;

  /**
   * Sets priority of contents of a torrent
   *
   * @param hash - Hash of the torrent.
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract setTorrentContentsPriority(hash: string, options: SetTorrentContentsPropertiesOptions): Promise<void>;

  /**
   * Starts torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract startTorrents(options: StartTorrentsOptions): Promise<void>;

  /**
   * Stops torrents
   *
   * @param options - An object of options...
   * @return - Rejects with error.
   */
  abstract stopTorrents(options: StopTorrentsOptions): Promise<void>;

  /**
   * Fetches the list of torrents
   *
   * @return - Resolves with TorrentListSummary or rejects with error.
   */
  abstract fetchTorrentList(): Promise<TorrentListSummary>;

  /**
   * Fetches the transfer summary
   *
   * @return - Resolves with TransferSummary or rejects with error.
   */
  abstract fetchTransferSummary(): Promise<TransferSummary>;

  /**
   * Gets session directory (where .torrent files are stored) of the torrent client
   *
   * @return - Resolves with path of session directory or rejects with error.
   */
  abstract getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}>;

  /**
   * Gets settings of the torrent client
   *
   * @return - Resolves with ClientSettings or rejects with error.
   */
  abstract getClientSettings(): Promise<ClientSettings>;

  /**
   * Sets settings of the torrent client
   *
   * @param settings - Settings to be set.
   * @return - Rejects with error.
   */
  abstract setClientSettings(settings: SetClientSettingsOptions): Promise<void>;

  abstract testGateway(): Promise<void>;

  constructor(user: UserInDatabase) {
    super(user);

    this.testGateway()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .catch(() => undefined);
  }

  destroyTimer() {
    if (this.retryTimer != null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  destroy(drop: boolean) {
    this.destroyTimer();
    this.retryTimer = undefined;

    return super.destroy(drop);
  }

  startTimer() {
    if (this.retryTimer === null) {
      this.retryTimer = setTimeout(() => {
        this.errorCount += 1;
        this.destroyTimer();
        this.testGateway().catch(() => undefined);
      }, config.torrentClientPollInterval * this.errorCount);
    }
  }

  processClientRequestSuccess = <T>(response: T): T => {
    this.destroyTimer();

    if (this.errorCount !== 0) {
      this.errorCount = 0;
      this.emit('CLIENT_CONNECTION_STATE_CHANGE', true);
    }

    return response;
  };

  processClientRequestError = (error: Error) => {
    if (this.errorCount === 0) {
      this.errorCount += 1;
      this.emit('CLIENT_CONNECTION_STATE_CHANGE', false);
    }

    this.startTimer();

    throw error;
  };
}

export default ClientGatewayService;
