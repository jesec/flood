import type {ClientSettings} from '@shared/types/ClientSettings';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';
import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsTagsOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

import BaseService from '../BaseService';
import config from '../../../config';

interface ClientGatewayServiceEvents {
  CLIENT_CONNECTION_STATE_CHANGE: (isConnected: boolean) => void;
  PROCESS_TORRENT_LIST_START: () => void;
  PROCESS_TORRENT_LIST_END: (torrentListSummary: TorrentListSummary) => void;
  PROCESS_TORRENT: (torrentProperties: TorrentProperties) => void;
}

abstract class ClientGatewayService extends BaseService<ClientGatewayServiceEvents> {
  errorCount = 0;
  retryTimer: NodeJS.Timeout | null = null;

  /**
   * Adds torrents by file
   *
   * @param {AddTorrentByFileOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract addTorrentsByFile(options: AddTorrentByFileOptions): Promise<void>;

  /**
   * Adds torrents by URL
   *
   * @param {AddTorrentByURLOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract addTorrentsByURL(options: AddTorrentByURLOptions): Promise<void>;

  /**
   * Checks torrents
   *
   * @param {CheckTorrentsOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract checkTorrents({hashes}: CheckTorrentsOptions): Promise<void>;

  /**
   * Gets the list of contents of a torrent.
   *
   * @param {string} hash - Hash of torrent
   * @return {Promise<TorrentContentTree>} - Resolves with TorrentContentTree or rejects with error.
   */
  abstract getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>>;

  /**
   * Gets the list of peers of a torrent.
   *
   * @param {string} hash - Hash of torrent
   * @return {Promise<Array<TorrentPeer>>} - Resolves with an array of TorrentPeer or rejects with error.
   */
  abstract getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>>;

  /**
   * Gets the list of trackers of a torrent.
   *
   * @param {string} hash - Hash of torrent
   * @return {Promise<Array<TorrentTracker>>} - Resolves with an array of TorrentTracker or rejects with error.
   */
  abstract getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>>;

  /**
   * Moves torrents to specified destination path.
   *
   * @param {MoveTorrentsOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract moveTorrents(options: MoveTorrentsOptions): Promise<void>;

  /**
   * Removes torrents. Optionally deletes data of torrents.
   *
   * @param {DeleteTorrentsOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract removeTorrents(options: DeleteTorrentsOptions): Promise<void>;

  /**
   * Sets priority of torrents
   *
   * @param {SetTorrentsPriorityOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract setTorrentsPriority(options: SetTorrentsPriorityOptions): Promise<void>;

  /**
   * Sets tags of torrents
   *
   * @param {SetTorrentsTagsOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract setTorrentsTags(options: SetTorrentsTagsOptions): Promise<void>;

  /**
   * Sets trackers of torrents
   *
   * @param {SetTorrentsTrackersOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract setTorrentsTrackers(options: SetTorrentsTrackersOptions): Promise<void>;

  /**
   * Sets priority of contents of a torrent
   *
   * @param {string} hash - Hash of the torrent.
   * @param {SetTorrentContentsPropertiesOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract setTorrentContentsPriority(hash: string, options: SetTorrentContentsPropertiesOptions): Promise<void>;

  /**
   * Starts torrents
   *
   * @param {StartTorrentsOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract startTorrents(options: StartTorrentsOptions): Promise<void>;

  /**
   * Stops torrents
   *
   * @param {StopTorrentsOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  abstract stopTorrents(options: StopTorrentsOptions): Promise<void>;

  /**
   * Fetches the list of torrents
   *
   * @return {Promise<TorrentListSummary>} - Resolves with TorrentListSummary or rejects with error.
   */
  abstract fetchTorrentList(): Promise<TorrentListSummary>;

  /**
   * Fetches the transfer summary
   *
   * @return {Promise<TransferSummary>} - Resolves with TransferSummary or rejects with error.
   */
  abstract fetchTransferSummary(): Promise<TransferSummary>;

  /**
   * Gets settings of the torrent client
   *
   * @return {Promise<ClientSettings>} - Resolves with ClientSettings or rejects with error.
   */
  abstract getClientSettings(): Promise<ClientSettings>;

  /**
   * Sets settings of the torrent client
   *
   * @param {SetClientSettingsOptions} - Settings to be set.
   * @return {Promise<void>} - Rejects with error.
   */
  abstract setClientSettings(settings: SetClientSettingsOptions): Promise<void>;

  abstract testGateway(): Promise<void>;

  destroyTimer() {
    if (this.retryTimer != null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  destroy() {
    this.destroyTimer();
    super.destroy();
  }

  startTimer() {
    if (this.retryTimer == null) {
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
