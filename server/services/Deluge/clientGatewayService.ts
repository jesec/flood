import {homedir} from 'node:os';
import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {DelugeConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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
import {TorrentTrackerType} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';

import {fetchUrls} from '../../util/fetchUtil';
import ClientGatewayService from '../clientGatewayService';
import ClientRequestManager from './clientRequestManager';
import {DelugeCoreTorrentFilePriority} from './types/DelugeCoreMethods';
import {getTorrentStatusFromStatuses} from './util/torrentPropertiesUtil';

class DelugeClientGatewayService extends ClientGatewayService {
  private clientRequestManager = new ClientRequestManager(this.user.client as DelugeConnectionSettings);

  async addTorrentsByFile({
    files,
    destination,
    isCompleted,
    isInitialSeeding,
    isSequential,
    start,
  }: Required<AddTorrentByFileOptions>): Promise<string[]> {
    const result = await Promise.all(
      files.map(async (file, index) =>
        this.clientRequestManager
          .coreAddTorrentFile(`${Date.now()}-${index}.torrent`, file, {
            download_location: destination,
            add_paused: !start,
            sequential_download: isSequential,
            super_seeding: isInitialSeeding,
          })
          .then(this.processClientRequestSuccess, this.processClientRequestError),
      ),
    );

    if (isCompleted) {
      // Deluge does not provide function to add completed torrents
      for await (const hash of result) {
        await this.checkTorrents({hashes: [hash]});
      }
    }

    return result.map((hash) => hash.toUpperCase());
  }

  async addTorrentsByURL({
    urls: inputUrls,
    cookies,
    destination,
    tags,
    isBasePath,
    isCompleted,
    isInitialSeeding,
    isSequential,
    start,
  }: Required<AddTorrentByURLOptions>): Promise<string[]> {
    const {files, urls} = await fetchUrls(inputUrls, cookies);

    if (!files[0] && !urls[0]) {
      throw new Error();
    }

    const result: string[] = [];

    if (urls[0]) {
      result.push(
        ...(await Promise.all(
          urls.map((url) =>
            this.clientRequestManager
              .coreAddTorrentMagnet(url, {
                download_location: destination,
                add_paused: !start,
                sequential_download: isSequential,
                super_seeding: isInitialSeeding,
              })
              .then(this.processClientRequestSuccess, this.processClientRequestError),
          ),
        )),
      );
    }

    if (files[0]) {
      result.push(
        ...(await this.addTorrentsByFile({
          files: files.map((file) => file.toString('base64')) as [string, ...string[]],
          destination,
          tags,
          isBasePath,
          isCompleted,
          isInitialSeeding,
          isSequential,
          start,
        })),
      );
    }

    return result;
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .coreForceRecheck(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager
      .coreGetTorrentStatus(hash, ['files', 'file_progress', 'file_priorities'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(({files, file_progress, file_priorities}) =>
        files.map((file) => {
          let priority = TorrentContentPriority.NORMAL;
          switch (file_priorities[file.index]) {
            case DelugeCoreTorrentFilePriority.Skip:
              priority = TorrentContentPriority.DO_NOT_DOWNLOAD;
              break;
            case DelugeCoreTorrentFilePriority.High:
              priority = TorrentContentPriority.HIGH;
              break;
            default:
              break;
          }

          return {
            index: file.index,
            path: file.path,
            filename: file.path.split('/').pop() || '',
            percentComplete: file_progress[file.index] * 100,
            priority,
            sizeBytes: file.size,
          };
        }),
      );
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager
      .coreGetTorrentStatus(hash, ['peers'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(({peers}) =>
        peers.map((peer) => ({
          address: peer.ip.split(':')[0],
          country: peer.country,
          clientVersion: peer.client,
          completedPercent: peer.progress,
          downloadRate: peer.down_speed,
          uploadRate: peer.up_speed,
          isEncrypted: false,
          isIncoming: false,
        })),
      );
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager
      .coreGetTorrentStatus(hash, ['trackers'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(({trackers}) =>
        trackers.map(({url}) => ({
          url,
          type: url.startsWith('http') ? TorrentTrackerType.HTTP : TorrentTrackerType.UDP,
        })),
      );
  }

  async moveTorrents({hashes, destination}: MoveTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .coreMoveStorage(hashes, destination)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .coreForceReannounce(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .coreRemoveTorrents(hashes, deleteData ?? false)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsInitialSeeding({hashes, isInitialSeeding}: SetTorrentsInitialSeedingOptions): Promise<void> {
    return this.clientRequestManager
      .coreSetTorrentOptions(hashes, {super_seeding: isInitialSeeding})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsPriority({}: SetTorrentsPriorityOptions): Promise<void> {
    return;
  }

  async setTorrentsSequential({hashes, isSequential}: SetTorrentsSequentialOptions): Promise<void> {
    return this.clientRequestManager
      .coreSetTorrentOptions(hashes, {sequential_download: isSequential})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsTags({}: SetTorrentsTagsOptions): Promise<void> {
    return;
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    return this.clientRequestManager
      .coreSetTorrentTrackers(
        hashes,
        trackers.map((url) => ({url, tier: 0})),
      )
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentContentsPriority(
    hash: string,
    {indices, priority}: SetTorrentContentsPropertiesOptions,
  ): Promise<void> {
    let delugePriority: DelugeCoreTorrentFilePriority = DelugeCoreTorrentFilePriority.Normal;
    switch (priority) {
      case TorrentContentPriority.DO_NOT_DOWNLOAD:
        delugePriority = DelugeCoreTorrentFilePriority.Skip;
        break;
      case TorrentContentPriority.HIGH:
        delugePriority = DelugeCoreTorrentFilePriority.High;
        break;
      default:
        break;
    }

    const {file_priorities} = await this.clientRequestManager
      .coreGetTorrentStatus(hash, ['file_priorities'])
      .then(this.processClientRequestSuccess, this.processClientRequestError);

    indices.forEach((index) => {
      file_priorities[index] = delugePriority;
    });

    return this.clientRequestManager
      .coreSetTorrentOptions([hash], {file_priorities})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .coreResumeTorrents(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .corePauseTorrents(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .coreGetTorrentsStatus([
        'active_time',
        'comment',
        'download_location',
        'download_payload_rate',
        'eta',
        'finished_time',
        'message',
        'name',
        'num_peers',
        'num_seeds',
        'private',
        'progress',
        'ratio',
        'sequential_download',
        'state',
        'super_seeding',
        'time_added',
        'total_done',
        'total_payload_download',
        'total_payload_upload',
        'total_peers',
        'total_size',
        'total_seeds',
        'tracker_host',
        'upload_payload_rate',
      ])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (torrentsStatus) => {
        this.emit('PROCESS_TORRENT_LIST_START');

        const dateNowSeconds = Math.ceil(Date.now() / 1000);

        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            Object.keys(torrentsStatus).map(async (hash) => {
              const status = torrentsStatus[hash];

              const torrentProperties: TorrentProperties = {
                bytesDone: status.total_done,
                comment: status.comment,
                dateActive:
                  status.download_payload_rate > 0 || status.upload_payload_rate > 0 ? -1 : status.active_time,
                dateAdded: status.time_added,
                dateCreated: 0,
                dateFinished:
                  status.finished_time > 0 ? Math.ceil((dateNowSeconds - status.finished_time) / 10) * 10 : 0,
                directory: status.download_location,
                downRate: status.download_payload_rate,
                downTotal: status.total_payload_download,
                eta: status.eta === 0 ? -1 : status.eta,
                hash: hash.toUpperCase(),
                isPrivate: status.private,
                isInitialSeeding: status.super_seeding,
                isSequential: status.sequential_download,
                message: status.message,
                name: status.name,
                peersConnected: status.num_peers,
                peersTotal: status.total_peers < 0 ? 0 : status.total_peers,
                percentComplete: status.progress,
                priority: 1,
                ratio: status.ratio,
                seedsConnected: status.num_seeds,
                seedsTotal: status.total_seeds < 0 ? 0 : status.total_seeds,
                sizeBytes: status.total_size,
                status: getTorrentStatusFromStatuses(status),
                tags: [],
                trackerURIs: [status.tracker_host],
                upRate: status.upload_payload_rate,
                upTotal: status.total_payload_upload,
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
      .coreGetSessionStatus([
        'net.recv_payload_bytes',
        'net.sent_payload_bytes',
        'payload_download_rate',
        'payload_upload_rate',
      ])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((response) => ({
        downRate: response['payload_download_rate'],
        downTotal: response['net.recv_payload_bytes'],
        upRate: response['payload_upload_rate'],
        upTotal: response['net.sent_payload_bytes'],
      }));
  }

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    // Deluge API does not provide session directory.
    // We can only guess with the common locations here.
    switch (process.platform) {
      case 'win32':
        if (process.env.APPDATA) {
          return {path: path.join(process.env.APPDATA, '\\deluge\\state'), case: 'lower'};
        }
        return {path: path.join(homedir(), '\\AppData\\deluge\\state'), case: 'lower'};
      default:
        return {path: path.join(homedir(), '/.config/deluge/state'), case: 'lower'};
    }
  }

  async getClientSettings(): Promise<ClientSettings> {
    return this.clientRequestManager
      .coreGetConfigValues([
        'dht',
        'download_location',
        'listen_interface',
        'listen_ports',
        'max_download_speed',
        'max_upload_speed',
        'max_upload_slots_per_torrent',
        'max_upload_slots_global',
        'random_port',
        'utpex',
      ])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((response) => ({
        dht: response.dht,
        dhtPort: response.listen_ports[0],
        directoryDefault: response.download_location,
        networkHttpMaxOpen: -1,
        networkLocalAddress: [response.listen_interface],
        networkMaxOpenFiles: -1,
        networkPortOpen: true,
        networkPortRandom: response.random_port,
        networkPortRange: response.listen_ports.join('-'),
        piecesHashOnCompletion: false,
        piecesMemoryMax: -1,
        protocolPex: response.utpex,
        throttleGlobalDownSpeed: response.max_download_speed,
        throttleGlobalUpSpeed: response.max_upload_speed,
        throttleMaxPeersNormal: -1,
        throttleMaxPeersSeed: -1,
        throttleMaxDownloads: -1,
        throttleMaxDownloadsGlobal: -1,
        throttleMaxUploads: response.max_upload_slots_per_torrent,
        throttleMaxUploadsGlobal: response.max_upload_slots_global,
        throttleMinPeersNormal: -1,
        throttleMinPeersSeed: -1,
        trackersNumWant: -1,
      }));
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    return this.clientRequestManager
      .coreSetConfig({
        dht: settings.dht,
        download_location: settings.directoryDefault,
        listen_interface: settings.networkLocalAddress?.[0],
        listen_ports: settings.networkPortRange?.split('-').map((port) => Number(port)),
        max_download_speed: settings.throttleGlobalDownSpeed,
        max_upload_speed: settings.throttleGlobalUpSpeed,
        max_upload_slots_per_torrent: settings.throttleMaxUploads,
        max_upload_slots_global: settings.throttleMaxUploadsGlobal,
        random_port: settings.networkPortRandom,
        utpex: settings.protocolPex,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
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
