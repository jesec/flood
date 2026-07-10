import {homedir} from 'node:os';
import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {NeptuneConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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
import type {TorrentList, TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';
import {NeptuneConnectionError, NeptuneHTTPError, TorrentState} from '@trim21/neptune';

import {TorrentContentPriority} from '../../../shared/types/TorrentContent';
import {fetchUrls} from '../../util/fetchUtil';
import {getDomainsFromURLs} from '../../util/torrentPropertiesUtil';
import ClientGatewayService from '../clientGatewayService';
import ClientRequestManager from './clientRequestManager';
import {getTorrentStatusFromState, getTorrentTrackerTypeFromURL} from './util/torrentPropertiesUtil';

class NeptuneClientGatewayService extends ClientGatewayService {
  private clientRequestManager = new ClientRequestManager(this.user.client as NeptuneConnectionSettings);

  processClientRequestError = (error: Error): never => {
    // Only connection-level errors (network failure or HTTP error) should
    // trigger connection state changes. RPC errors mean the server responded
    // correctly but rejected the operation (e.g. "reannounce not allowed yet").
    if (error instanceof NeptuneConnectionError || error instanceof NeptuneHTTPError) {
      if (this.errorCount === 0) {
        this.errorCount += 1;
        this.emit('CLIENT_CONNECTION_STATE_CHANGE', false);
      }

      this.startTimer();
    }

    throw error;
  };

  async addTorrentsByFile({
    files,
    destination,
    tags,
    isBasePath,
    isCompleted,
    start,
  }: Required<AddTorrentByFileOptions>): Promise<string[]> {
    const hashes: string[] = [];

    for (const file of files) {
      const result = await this.clientRequestManager
        .addTorrent(file, destination, tags, isBasePath, isCompleted)
        .then(this.processClientRequestSuccess, this.processClientRequestError);

      hashes.push(result.info_hash.toUpperCase());

      if (!start) {
        await this.clientRequestManager.stopTorrent(result.info_hash);
      }
    }

    return hashes;
  }

  async addTorrentsByURL({
    urls: inputUrls,
    cookies,
    destination,
    tags,
    isBasePath,
    isCompleted,
    start,
  }: Required<AddTorrentByURLOptions>): Promise<string[]> {
    const {files} = await fetchUrls(inputUrls, cookies);

    if (!files[0]) {
      throw new Error('Neptune only supports adding torrents by file, not by magnet link or URL');
    }

    return this.addTorrentsByFile({
      files: files.map((file) => file.toString('base64')) as [string, ...string[]],
      destination,
      tags,
      isBasePath,
      isCompleted,
      isInitialSeeding: false,
      isSequential: false,
      start,
    });
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) =>
        this.clientRequestManager
          .recheckTorrent(hash.toLowerCase())
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager
      .getTorrentFiles(hash.toLowerCase())
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((response) => {
        return response.files.map((file) => ({
          index: file.index,
          path: file.path.join('/'),
          filename: file.path[file.path.length - 1] || '',
          percentComplete: Math.floor(file.progress * 10000) / 100,
          priority: TorrentContentPriority.NORMAL,
          sizeBytes: file.size,
        }));
      });
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager
      .getTorrentPeers(hash.toLowerCase())
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((response) => {
        return response.peers.map((peer) => ({
          address: peer.address,
          country: '',
          clientVersion: peer.client,
          completedPercent: peer.progress * 100,
          downloadRate: peer.download_rate,
          uploadRate: peer.upload_rate,
          isEncrypted: false,
          isIncoming: peer.is_incoming,
        }));
      });
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager
      .getTorrentTrackers(hash.toLowerCase())
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((response) => {
        return response.trackers.map((tracker) => ({
          url: tracker.url,
          type: getTorrentTrackerTypeFromURL(tracker.url),
          msg: tracker.message || '',
        }));
      });
  }

  async moveTorrents({hashes, destination}: MoveTorrentsOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) =>
        this.clientRequestManager
          .moveTorrent(hash.toLowerCase(), destination)
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );
  }

  async reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) =>
        this.clientRequestManager
          .reannounceTorrent(hash.toLowerCase())
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) =>
        this.clientRequestManager
          .removeTorrent(hash.toLowerCase(), deleteData || false)
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );
  }

  async setTorrentsInitialSeeding(_options: SetTorrentsInitialSeedingOptions): Promise<void> {
    throw new Error('Neptune does not support initial seeding mode');
  }

  async setTorrentsPriority(_options: SetTorrentsPriorityOptions): Promise<void> {
    // Neptune does not support torrent-level priority
  }

  async setTorrentsSequential(_options: SetTorrentsSequentialOptions): Promise<void> {
    throw new Error('Neptune does not support sequential download');
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    await Promise.all(
      hashes.map(async (hash) => {
        const lowerHash = hash.toLowerCase();
        await this.clientRequestManager
          .removeTorrentTags(lowerHash, [])
          .then(this.processClientRequestSuccess, this.processClientRequestError);
        if (tags.length > 0) {
          await this.clientRequestManager
            .addTorrentTags(lowerHash, tags)
            .then(this.processClientRequestSuccess, this.processClientRequestError);
        }
      }),
    );
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    await Promise.all(
      hashes.map(async (hash) => {
        const lowerHash = hash.toLowerCase();
        const currentTrackers = await this.clientRequestManager
          .getTorrentTrackers(lowerHash)
          .then(this.processClientRequestSuccess, this.processClientRequestError);

        await Promise.all(
          currentTrackers.trackers
            .filter((t) => t.url !== '** [DHT] **' && t.url !== '** [PeX] **')
            .map((t) => this.clientRequestManager.removeTorrentTracker(lowerHash, t.url)),
        );

        await Promise.all(trackers.map((url) => this.clientRequestManager.addTorrentTracker(lowerHash, url)));
      }),
    );
  }

  async setTorrentContentsPriority(
    hash: string,
    {indices, priority}: SetTorrentContentsPropertiesOptions,
  ): Promise<void> {
    const neptunePriority = priority === TorrentContentPriority.DO_NOT_DOWNLOAD ? 0 : 1;

    await this.clientRequestManager
      .setTorrentFilePriority(hash.toLowerCase(), indices, neptunePriority)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) =>
        this.clientRequestManager
          .startTorrent(hash.toLowerCase())
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) =>
        this.clientRequestManager
          .stopTorrent(hash.toLowerCase())
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .getTorrentList()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (response) => {
        this.emit('PROCESS_TORRENT_LIST_START');

        const torrentList: TorrentList = {};

        for (const torrent of response.torrents) {
          const trackerURIs = getDomainsFromURLs(Object.keys(torrent.tracker_errors ?? {}));

          const trackerErrorMessages = Object.values(torrent.tracker_errors ?? {}).filter(Boolean);
          const trackerMessage = trackerErrorMessages.find((m) => m.length > 0) ?? '';
          const combinedMessage = torrent.message || trackerMessage;

          const torrentProperties: TorrentProperties = {
            bytesDone: torrent.completed,
            comment: torrent.comment,
            dateActive: 0,
            dateAdded: torrent.add_at,
            dateCreated: 0,
            dateFinished: torrent.completed_at,
            directory: torrent.directory_base,
            downRate: torrent.download_rate,
            downTotal: torrent.download_total,
            eta:
              torrent.download_rate > 0 && torrent.selected_size > 0
                ? (torrent.selected_size - torrent.completed) / torrent.download_rate
                : -1,
            hash: torrent.hash.toUpperCase(),
            isPrivate: torrent.private,
            isInitialSeeding: false,
            isSequential: false,
            message: combinedMessage,
            name: torrent.name,
            peersConnected: torrent.connected_downloading,
            peersTotal: torrent.total_downloading,
            percentComplete:
              torrent.total_length > 0 ? Math.floor((torrent.completed / torrent.selected_size) * 10000) / 100 : 0,
            priority: 1,
            ratio:
              torrent.upload_total > 0 && torrent.download_total > 0
                ? torrent.upload_total / torrent.download_total
                : 0,
            seedsConnected: torrent.connected_seeding,
            seedsTotal: torrent.total_seeding,
            sizeBytes: torrent.total_length,
            selectedSizeBytes: torrent.selected_size,
            status: getTorrentStatusFromState(
              torrent.state as (typeof TorrentState)[keyof typeof TorrentState],
              combinedMessage,
              torrent.download_rate,
              torrent.upload_rate,
            ),
            tags: torrent.tags,
            trackerURIs,
            upRate: torrent.upload_rate,
            upTotal: torrent.upload_total,
          };

          this.emit('PROCESS_TORRENT', torrentProperties);

          torrentList[torrentProperties.hash] = torrentProperties;
        }

        const torrentListSummary: TorrentListSummary = {
          id: Date.now(),
          torrents: torrentList,
        };

        this.emit('PROCESS_TORRENT_LIST_END', torrentListSummary);
        return torrentListSummary;
      });
  }

  async fetchTransferSummary(): Promise<TransferSummary> {
    return this.clientRequestManager
      .getTransferSummary()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((summary) => ({
        downRate: summary.download_rate,
        downTotal: summary.download_total,
        upRate: summary.upload_rate,
        upTotal: summary.upload_total,
      }));
  }

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    return {path: path.join(homedir(), '.neptune', 'torrents'), case: 'lower'};
  }

  async getClientSettings(): Promise<ClientSettings> {
    const config = await this.clientRequestManager
      .getTransferConfig()
      .then(this.processClientRequestSuccess, () => ({download_limit: 0, upload_limit: 0}));

    return {
      dht: false,
      dhtPort: 0,
      directoryDefault: '',
      networkHttpMaxOpen: 0,
      networkLocalAddress: [],
      networkMaxOpenFiles: 0,
      networkPortOpen: false,
      networkPortRandom: false,
      networkPortRange: '',
      piecesHashOnCompletion: false,
      piecesMemoryMax: 0,
      protocolPex: false,
      throttleGlobalDownSpeed: config.download_limit,
      throttleGlobalUpSpeed: config.upload_limit,
      throttleMaxPeersNormal: 0,
      throttleMaxPeersSeed: 0,
      throttleMaxDownloads: 0,
      throttleMaxDownloadsGlobal: 0,
      throttleMaxUploads: 0,
      throttleMaxUploadsGlobal: 0,
      throttleMinPeersNormal: 0,
      throttleMinPeersSeed: 0,
      trackersNumWant: 0,
    };
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    if (settings.throttleGlobalDownSpeed != null) {
      await this.clientRequestManager.setDownloadLimit(settings.throttleGlobalDownSpeed);
    }
    if (settings.throttleGlobalUpSpeed != null) {
      await this.clientRequestManager.setUploadLimit(settings.throttleGlobalUpSpeed);
    }
  }

  async testGateway(): Promise<void> {
    return this.clientRequestManager
      .testConnection()
      .then(() => this.processClientRequestSuccess(undefined), this.processClientRequestError);
  }
}

export default NeptuneClientGatewayService;
