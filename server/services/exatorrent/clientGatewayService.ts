import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {ExatorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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
import {TorrentContentPriority} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';

import ClientGatewayService from '../clientGatewayService';
import {lookup} from '../geoip';
import ClientRequestManager from './clientRequestManager';
import {ExatorrentTorrentFile} from './types/ExatorrentCoreMethods';
import {ExatorrentRateComputer} from './util/rates';
import {getTorrentStatuses, getTrackerType} from './util/torrentPropertiesUtil';

const DEFAULT_PATH = '/exa/exadir/';

class ExatorrentClientGatewayService extends ClientGatewayService {
  private clientRequestManager = new ClientRequestManager(this.user.client as ExatorrentConnectionSettings);
  private rateComputer = new ExatorrentRateComputer();

  async addTorrentsByFile(options: Required<AddTorrentByFileOptions>): Promise<string[]> {
    return Promise.all(options.files.map((file) => this.clientRequestManager.addTorrent(file, !options.start))).then(
      this.processClientRequestSuccess,
      this.processClientRequestError,
    );
  }

  async addTorrentsByURL(options: Required<AddTorrentByURLOptions>): Promise<string[]> {
    return Promise.all(options.urls.map((url) => this.clientRequestManager.addMagnet(url, !options.start))).then(
      this.processClientRequestSuccess,
      this.processClientRequestError,
    );
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    await Promise.all(hashes.map((hash) => this.clientRequestManager.verifyTorrent(hash)));
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager
      .getTorrentFiles(hash)
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((files) => {
        return files.map((file: ExatorrentTorrentFile, index) => ({
          index,
          path: file.path,
          filename: file.displaypath,
          percentComplete: (file.bytescompleted / file.length) * 100,
          priority: file.priority === 0 ? TorrentContentPriority.NORMAL : TorrentContentPriority.DO_NOT_DOWNLOAD,
          sizeBytes: file.length,
        }));
      });
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    const peers = await this.clientRequestManager
      .getTorrentPeerConns(hash)
      .then(this.processClientRequestSuccess, this.processClientRequestError);

    return peers.map((peer) => {
      const ip = peer.remoteaddr.includes('[')
        ? peer.remoteaddr.split(']:')[0].slice(1)
        : peer.remoteaddr.split(':')[0];
      return {
        address: peer.remoteaddr,
        country: lookup(ip),
        clientVersion: peer.peerclientname,
        completedPercent: 0,
        downloadRate: peer.downloadrate,
        uploadRate: 0,
        isEncrypted: peer.peerpreferencryption,
        isIncoming: false,
      };
    });
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager
      .getTorrent(hash)
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((torrent) => {
        return torrent.announcelist.map((tracker) => ({
          url: tracker,
          type: getTrackerType(tracker),
        }));
      });
  }

  async moveTorrents(_options: MoveTorrentsOptions): Promise<void> {
    return;
  }

  async reannounceTorrents({}: ReannounceTorrentsOptions): Promise<void> {
    return;
  }

  async removeTorrents(options: DeleteTorrentsOptions): Promise<void> {
    await Promise.all(
      options.hashes.map((hash) =>
        this.clientRequestManager.removeTorrent(hash).then(() => {
          if (options.deleteData) this.clientRequestManager.deletetorrent(hash);
        }),
      ),
    ).then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentContentsPriority(_hash: string, _options: SetTorrentContentsPropertiesOptions): Promise<void> {
    return;
  }

  async setTorrentsInitialSeeding(_options: SetTorrentsInitialSeedingOptions): Promise<void> {
    return;
  }

  async setTorrentsPriority(_options: SetTorrentsPriorityOptions): Promise<void> {
    return;
  }

  async setTorrentsSequential(_options: SetTorrentsSequentialOptions): Promise<void> {
    return;
  }

  async setTorrentsTags(_options: SetTorrentsTagsOptions): Promise<void> {
    return;
  }

  async setTorrentsTrackers(options: SetTorrentsTrackersOptions): Promise<void> {
    await Promise.all(options.hashes.map((hash) => this.clientRequestManager.addTrackers(hash, options.trackers))).then(
      this.processClientRequestSuccess,
      this.processClientRequestError,
    );
  }

  async startTorrents(options: StartTorrentsOptions): Promise<void> {
    await Promise.all(options.hashes.map((hash) => this.clientRequestManager.startTorrent(hash))).then(
      this.processClientRequestSuccess,
      this.processClientRequestError,
    );
  }

  async stopTorrents(options: StopTorrentsOptions): Promise<void> {
    await Promise.all(options.hashes.map((hash) => this.clientRequestManager.stopTorrent(hash))).then(
      this.processClientRequestSuccess,
      this.processClientRequestError,
    );
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .getTorrents()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (torrentsStatus) => {
        this.emit('PROCESS_TORRENT_LIST_START');

        const dateNowSeconds = Math.ceil(Date.now() / 1000);

        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            torrentsStatus
              .filter((torrent) => torrent.state !== 'removed')
              .map(async (torrent) => {
                const downloadRate = this.rateComputer.get_rate(
                  torrent.infohash + 'down',
                  dateNowSeconds,
                  torrent.bytescompleted,
                );
                const uploadRate = this.rateComputer.get_rate(
                  torrent.infohash + 'up',
                  dateNowSeconds,
                  torrent.byteswritten,
                );
                const torrentProperties: TorrentProperties = {
                  bytesDone: torrent.bytescompleted,
                  comment: '',
                  dateActive: torrent.starteddate || 0,
                  dateAdded: torrent.addeddate || 0,
                  dateCreated: torrent.creationdate,
                  dateFinished: 0,
                  directory: torrent.infohash,
                  downRate: downloadRate,
                  downTotal: torrent.bytescompleted || 0,
                  eta: this.rateComputer.get_eta(downloadRate, torrent.bytescompleted, torrent.length),
                  hash: torrent.infohash.toUpperCase(),
                  isPrivate: torrent.private,
                  isInitialSeeding: true,
                  isSequential: false,
                  message: '',
                  name: torrent.name,
                  peersConnected: torrent.activepeers || 0,
                  peersTotal: torrent.totalpeers || 0,
                  percentComplete: (torrent.bytescompleted / torrent.length) * 100,
                  priority: 1,
                  ratio: torrent.byteswritten / torrent.bytescompleted,
                  seedsConnected: torrent.connectedseeders || 0,
                  seedsTotal: 0,
                  sizeBytes: torrent.length,
                  status: getTorrentStatuses(torrent),
                  tags: [],
                  trackerURIs: torrent.announcelist || [],
                  upRate: uploadRate,
                  upTotal: torrent.byteswritten || 0,
                };

                this.emit('PROCESS_TORRENT', torrentProperties);
                return {
                  [torrentProperties.hash]: torrentProperties,
                };
              }),
          )),
        );

        const torrentListSummary = {
          id: Date.now(),
          torrents: torrentList,
        };

        this.emit('PROCESS_TORRENT_LIST_END', torrentListSummary);
        return torrentListSummary;
      });
  }

  async fetchTransferSummary(): Promise<TransferSummary> {
    return this.clientRequestManager
      .getNetworkStats()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((stats) => {
        const dateNowSeconds = Math.ceil(Date.now() / 1000);

        return {
          downRate: this.rateComputer.get_rate('totalDown', dateNowSeconds, stats.bytesread),
          downTotal: stats.bytesread,
          upRate: this.rateComputer.get_rate('totalUp', dateNowSeconds, stats.byteswritten),
          upTotal: stats.byteswritten,
        };
      });
  }

  getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    return Promise.resolve({case: 'lower', path: DEFAULT_PATH + 'cache'});
  }

  getClientSettings(): Promise<ClientSettings> {
    return Promise.resolve({
      dht: false,
      dhtPort: 0,
      directoryDefault: DEFAULT_PATH + 'torrents',
      networkHttpMaxOpen: 0,
      networkLocalAddress: [],
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
    });
  }

  async setClientSettings(_settings: SetClientSettingsOptions): Promise<void> {
    return;
  }

  async testGateway(): Promise<void> {
    return;
  }
}

export default ExatorrentClientGatewayService;
