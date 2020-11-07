import geoip from 'geoip-country';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentList, TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';
import type {TransmissionConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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

import ClientGatewayService from '../interfaces/clientGatewayService';
import ClientRequestManager from './clientRequestManager';
import {getDomainsFromURLs} from '../../util/torrentPropertiesUtil';
import {TorrentContentPriority} from '../../../shared/types/TorrentContent';
import {TorrentPriority} from '../../../shared/types/Torrent';
import torrentPropertiesUtil from './util/torrentPropertiesUtil';
import {TorrentTrackerType} from '../../../shared/types/TorrentTracker';
import {TransmissionPriority, TransmissionTorrentsSetArguments} from './types/TransmissionTorrentsMethods';

class TransmissionClientGatewayService extends ClientGatewayService {
  clientRequestManager = new ClientRequestManager(this.user.client as TransmissionConnectionSettings);

  async addTorrentsByFile({files, destination, tags, start}: AddTorrentByFileOptions): Promise<void> {
    const addedTorrents: Array<string> = (
      await Promise.all(
        files.map(async (file) => {
          const {hashString} =
            (await this.clientRequestManager
              .addTorrent({metainfo: file, 'download-dir': destination, paused: !start})
              .then(this.processClientRequestSuccess, this.processClientRequestError)
              .catch(() => undefined)) || {};
          return hashString;
        }),
      )
    ).filter((hash) => hash != null) as Array<string>;

    if (tags?.length) {
      await this.setTorrentsTags({hashes: addedTorrents, tags});
    }
  }

  async addTorrentsByURL({urls, cookies, destination, tags, start}: AddTorrentByURLOptions): Promise<void> {
    const addedTorrents: Array<string> = (
      await Promise.all(
        urls.map(async (url) => {
          const domain = url.split('/')[2];
          const {hashString} =
            (await this.clientRequestManager
              .addTorrent({
                filename: url,
                cookies: cookies?.[domain] != null ? `${cookies[domain].join('; ')};` : undefined,
                'download-dir': destination,
                paused: !start,
              })
              .then(this.processClientRequestSuccess, this.processClientRequestError)
              .catch(() => undefined)) || {};
          return hashString;
        }),
      )
    ).filter((hash) => hash != null) as Array<string>;

    if (tags?.length) {
      await this.setTorrentsTags({hashes: addedTorrents, tags});
    }
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .verifyTorrents(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager
      .getTorrents(hash, ['files', 'fileStats'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((torrents) => {
        const [torrent] = torrents;
        if (torrent == null) {
          return Promise.reject();
        }

        const {files, fileStats} = torrent;
        if (files.length !== fileStats.length) {
          return Promise.reject();
        }

        const torrentContents: Array<TorrentContent> = files.map((file, index) => {
          const stat = fileStats[index];

          let priority = TorrentContentPriority.NORMAL;
          if (!stat.wanted) {
            priority = TorrentContentPriority.DO_NOT_DOWNLOAD;
          } else if (stat.priority === TransmissionPriority.TR_PRI_HIGH) {
            priority = TorrentContentPriority.HIGH;
          }

          return {
            index,
            path: file.name,
            filename: file.name.split('/').pop() as string,
            percentComplete: Math.trunc(file.bytesCompleted / file.length),
            priority,
            sizeBytes: file.length,
          };
        });

        return torrentContents;
      });
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager
      .getTorrents(hash, ['peers'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((torrents) => {
        const [torrent] = torrents;
        if (torrent == null) {
          return Promise.reject();
        }

        const torrentPeers: Array<TorrentPeer> = torrent.peers
          .filter((peer) => peer.isDownloadingFrom || peer.isUploadingTo)
          .map((peer) => ({
            address: peer.address,
            country: geoip.lookup(peer.address)?.country || '',
            clientVersion: peer.clientName,
            completedPercent: Math.trunc(peer.progress * 100),
            downloadRate: peer.rateToClient,
            uploadRate: peer.rateToPeer,
            isEncrypted: peer.isEncrypted,
            isIncoming: peer.isIncoming,
          }));

        return torrentPeers;
      });
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager
      .getTorrents(hash, ['trackerStats'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((torrents) => {
        const [torrent] = torrents;
        if (torrent == null) {
          return Promise.reject();
        }

        const torrentTrackers: Array<TorrentTracker> = torrent.trackerStats.map((tracker) => ({
          url: tracker.announce,
          type: tracker.announce.startsWith('udp') ? TorrentTrackerType.UDP : TorrentTrackerType.HTTP,
        }));

        return torrentTrackers;
      });
  }

  async moveTorrents({hashes, destination, moveFiles}: MoveTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .setTorrentsLocation(hashes, destination, moveFiles)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .removeTorrents(hashes, deleteData)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsPriority({hashes, priority}: SetTorrentsPriorityOptions): Promise<void> {
    let transmissionPriority = TransmissionPriority.TR_PRI_NORMAL;

    switch (priority) {
      case TorrentPriority.DO_NOT_DOWNLOAD:
        return undefined;
      case TorrentPriority.LOW:
        transmissionPriority = TransmissionPriority.TR_PRI_LOW;
        break;
      case TorrentPriority.HIGH:
        transmissionPriority = TransmissionPriority.TR_PRI_HIGH;
        break;
      default:
        break;
    }

    return this.clientRequestManager
      .setTorrentsProperties({ids: hashes, bandwidthPriority: transmissionPriority})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    return this.clientRequestManager
      .setTorrentsProperties({ids: hashes, labels: tags})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    const torrentsProcessed: Array<string> = [];

    // Remove existing trackers
    await this.clientRequestManager
      .getTorrents(hashes, ['trackers'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((torrents) =>
        torrents.forEach((torrent, index) => {
          const hash = hashes[index];
          this.clientRequestManager
            .setTorrentsProperties({
              ids: hash,
              trackerRemove: torrent.trackers.map((tracker) => tracker.id),
            })
            .then(
              () => {
                torrentsProcessed.push(hash);
              },
              () => undefined,
            );
        }),
      );

    return this.clientRequestManager
      .setTorrentsProperties({ids: torrentsProcessed, trackerAdd: trackers})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentContentsPriority(
    hash: string,
    {indices, priority}: SetTorrentContentsPropertiesOptions,
  ): Promise<void> {
    let wantedArgument: keyof TransmissionTorrentsSetArguments = 'files-wanted';
    let priorityArgument: keyof TransmissionTorrentsSetArguments = 'priority-normal';

    switch (priority) {
      case TorrentContentPriority.DO_NOT_DOWNLOAD:
        wantedArgument = 'files-unwanted';
        break;
      case TorrentContentPriority.HIGH:
        priorityArgument = 'priority-high';
        break;
      default:
        break;
    }

    return this.clientRequestManager
      .setTorrentsProperties({
        ids: hash,
        [wantedArgument]: indices,
        [priorityArgument]: indices,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .startTorrents(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .stopTorrents(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .getTorrents(null, [
        'hashString',
        'downloadDir',
        'name',
        'haveValid',
        'addedDate',
        'dateCreated',
        'rateDownload',
        'rateUpload',
        'downloadedEver',
        'uploadedEver',
        'eta',
        'isPrivate',
        'error',
        'errorString',
        'peersGettingFromUs',
        'peersSendingToUs',
        'status',
        'totalSize',
        'trackers',
        'labels',
      ])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (torrents) => {
        this.emit('PROCESS_TORRENT_LIST_START');

        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            torrents.map(async (torrent) => {
              const percentComplete = Math.trunc((torrent.haveValid / torrent.totalSize) * 100);
              const ratio = torrent.downloadedEver === 0 ? -1 : torrent.uploadedEver / torrent.downloadedEver;
              const trackerURIs = getDomainsFromURLs(torrent.trackers.map((tracker) => tracker.announce));
              const status = torrentPropertiesUtil.getTorrentStatus(torrent);

              const torrentProperties: TorrentProperties = {
                hash: torrent.hashString,
                name: torrent.name,
                bytesDone: torrent.haveValid,
                dateAdded: torrent.addedDate,
                dateCreated: torrent.dateCreated,
                directory: torrent.downloadDir,
                downRate: torrent.rateDownload,
                downTotal: torrent.downloadedEver,
                upRate: torrent.rateUpload,
                upTotal: torrent.uploadedEver,
                eta: torrent.eta,
                isPrivate: torrent.isPrivate,
                message: torrent.errorString,
                peersConnected: torrent.peersGettingFromUs,
                peersTotal: torrent.peersGettingFromUs,
                percentComplete,
                priority: TorrentPriority.NORMAL,
                ratio,
                seedsConnected: torrent.peersSendingToUs,
                seedsTotal: torrent.peersSendingToUs,
                sizeBytes: torrent.totalSize,
                status,
                tags: torrent.labels || [],
                trackerURIs,
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
      .getSessionStats()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((stats) => {
        return {
          downRate: stats.downloadSpeed,
          downTotal: stats['current-stats'].downloadedBytes,
          upRate: stats.uploadSpeed,
          upTotal: stats['current-stats'].uploadedBytes,
        };
      });
  }

  async getClientSettings(): Promise<ClientSettings> {
    return this.clientRequestManager
      .getSessionProperties([
        'dht-enabled',
        'peer-port',
        'download-dir',
        'peer-port-random-on-start',
        'pex-enabled',
        'speed-limit-down',
        'speed-limit-down-enabled',
        'speed-limit-up',
        'speed-limit-up-enabled',
        'peer-limit-global',
        'peer-limit-per-torrent',
        'seed-queue-enabled',
        'seed-queue-size',
      ])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((properties) => {
        const clientSettings: ClientSettings = {
          dht: properties['dht-enabled'],
          dhtPort: properties['peer-port'],
          directoryDefault: properties['download-dir'],
          networkHttpMaxOpen: 0,
          networkLocalAddress: [],
          networkMaxOpenFiles: 0,
          networkPortOpen: true,
          networkPortRandom: properties['peer-port-random-on-start'],
          networkPortRange: `${properties['peer-port']}`,
          piecesHashOnCompletion: false,
          piecesMemoryMax: 0,
          protocolPex: properties['pex-enabled'],
          throttleGlobalDownMax: properties['speed-limit-down-enabled'] ? properties['speed-limit-down'] : 0,
          throttleGlobalUpMax: properties['speed-limit-up-enabled'] ? properties['speed-limit-up'] : 0,
          throttleMaxPeersNormal: 0,
          throttleMaxPeersSeed: 0,
          throttleMaxDownloads: 0,
          throttleMaxDownloadsGlobal: 0,
          throttleMaxUploads: 0,
          throttleMaxUploadsGlobal: properties['seed-queue-enabled'] ? properties['seed-queue-size'] : 0,
          throttleMinPeersNormal: 0,
          throttleMinPeersSeed: 0,
          trackersNumWant: 0,
        };

        return clientSettings;
      });
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    return this.clientRequestManager
      .setSessionProperties({
        'dht-enabled': settings.dht,
        'download-dir': settings.directoryDefault,
        'peer-port': settings.networkPortRange ? Number(settings.networkPortRange?.split('-')[0]) : undefined,
        'peer-port-random-on-start': settings.networkPortRandom,
        'pex-enabled': settings.protocolPex,
        'speed-limit-down-enabled': settings.throttleGlobalDownMax !== 0,
        'speed-limit-down': settings.throttleGlobalDownMax,
        'speed-limit-up-enabled': settings.throttleGlobalUpMax !== 0,
        'speed-limit-up': settings.throttleGlobalUpMax,
        'seed-queue-enabled': settings.throttleMaxUploadsGlobal !== 0,
        'seed-queue-size': settings.throttleMaxUploadsGlobal,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async testGateway(): Promise<void> {
    return this.clientRequestManager
      .updateSessionID()
      .then(() => this.processClientRequestSuccess(undefined), this.processClientRequestError);
  }
}

export default TransmissionClientGatewayService;
