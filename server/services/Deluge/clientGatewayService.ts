import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
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
import type {DelugeConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

import ClientGatewayService from '../interfaces/clientGatewayService';
import ClientRequestManager from './clientRequestManager';

class DelugeClientGatewayService extends ClientGatewayService {
  private clientRequestManager = new ClientRequestManager(this.user.client as DelugeConnectionSettings);

  async addTorrentsByFile({
    files,
    destination,
    tags,
    isBasePath,
    isCompleted,
    isInitialSeeding,
    isSequential,
    start,
  }: Required<AddTorrentByFileOptions>): Promise<string[]> {
    return [];
  }

  async addTorrentsByURL({
    urls,
    cookies,
    destination,
    tags,
    isBasePath,
    isCompleted,
    isSequential,
    start,
  }: Required<AddTorrentByURLOptions>): Promise<string[]> {
    return [];
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    return;
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return [];
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return [];
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return [];
  }

  async moveTorrents({hashes, destination}: MoveTorrentsOptions): Promise<void> {
    return;
  }

  async reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void> {
    return;
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return;
  }

  async setTorrentsInitialSeeding({hashes, isInitialSeeding}: SetTorrentsInitialSeedingOptions): Promise<void> {
    return;
  }

  async setTorrentsPriority({hashes, priority}: SetTorrentsPriorityOptions): Promise<void> {
    return;
  }

  async setTorrentsSequential({hashes, isSequential}: SetTorrentsSequentialOptions): Promise<void> {
    return;
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    return;
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    return;
  }

  async setTorrentContentsPriority(
    hash: string,
    {indices, priority}: SetTorrentContentsPropertiesOptions,
  ): Promise<void> {
    return;
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    return;
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    return;
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return {
      id: Date.now(),
      torrents: {},
    };
  }

  async fetchTransferSummary(): Promise<TransferSummary> {
    return {
      downRate: 0,
      downTotal: 0,
      upRate: 0,
      upTotal: 0,
    };
  }

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    return {path: '/', case: 'lower'};
  }

  async getClientSettings(): Promise<ClientSettings> {
    return {
      dht: false,
      dhtPort: 0,
      directoryDefault: '/',
      networkHttpMaxOpen: 0,
      networkLocalAddress: [''],
      networkMaxOpenFiles: 0,
      networkPortOpen: false,
      networkPortRandom: false,
      networkPortRange: '',
      piecesHashOnCompletion: false,
      piecesMemoryMax: 0,
      protocolPex: false,
      throttleGlobalDownSpeed: 0,
      throttleGlobalUpSpeed: 0,
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
    return;
  }

  async testGateway(): Promise<void> {
    await this.clientRequestManager
      .daemonGetMethodList()
      .then(this.processClientRequestSuccess, () =>
        this.clientRequestManager.reconnect().then(this.processClientRequestSuccess, this.processClientRequestError),
      );
  }
}

export default DelugeClientGatewayService;
