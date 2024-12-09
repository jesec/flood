import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {TransmissionConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
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

import {TorrentPriority} from '../../../shared/types/Torrent';
import {TorrentContentPriority} from '../../../shared/types/TorrentContent';
import {TorrentTrackerType} from '../../../shared/types/TorrentTracker';
import {fetchUrls} from '../../util/fetchUtil';
import {getDomainsFromURLs} from '../../util/torrentPropertiesUtil';
import ClientGatewayService from '../clientGatewayService';
import * as geoip from '../geoip';
import ClientRequestManager from './clientRequestManager';
import {TransmissionPriority, TransmissionTorrentsSetArguments} from './types/TransmissionTorrentsMethods';
import torrentPropertiesUtil from './util/torrentPropertiesUtil';

class TransmissionClientGatewayService extends ClientGatewayService {
  clientRequestManager = new ClientRequestManager(this.user.client as TransmissionConnectionSettings);

  async addTorrentsByFile({
    files,
    destination,
    tags,
    isCompleted,
    start,
  }: Required<AddTorrentByFileOptions>): Promise<string[]> {
    const addedTorrents = await Promise.all(
      files.map(async (file) => {
        const {hashString} =
          (await this.clientRequestManager
            .addTorrent({
              metainfo: file,
              'download-dir': destination,
              paused: !start,
            })
            .then(this.processClientRequestSuccess, this.processClientRequestError)
            .catch(() => undefined)) || {};
        return hashString;
      }),
    ).then((results) => results.filter((hash) => hash) as string[]);

    if (addedTorrents[0] == null) {
      throw new Error();
    }

    if (tags.length > 0) {
      await this.setTorrentsTags({hashes: addedTorrents as [string, ...string[]], tags});
    }

    if (isCompleted) {
      // Transmission doesn't support skipping verification
      this.checkTorrents({hashes: addedTorrents}).catch(() => undefined);
    }

    return addedTorrents;
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
              .addTorrent({
                filename: url,
                'download-dir': destination,
                paused: !start,
              })
              .then(this.processClientRequestSuccess, this.processClientRequestError)
              .catch(() => undefined)
              .then((result) => result?.hashString),
          ),
        ).then((hashes) => hashes.filter((hash) => hash) as string[])),
      );
    }

    if (result[0] && tags.length > 0) {
      await this.setTorrentsTags({hashes: result as [string, ...string[]], tags});
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
          throw new Error();
        }

        const {files, fileStats} = torrent;
        if (files.length !== fileStats.length) {
          throw new Error();
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
            percentComplete: (file.bytesCompleted / file.length) * 100,
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
          throw new Error();
        }

        const torrentPeers: Array<TorrentPeer> = torrent.peers
          .filter((peer) => peer.isDownloadingFrom || peer.isUploadingTo)
          .map((peer) => ({
            address: peer.address,
            country: geoip.lookup(peer.address),
            clientVersion: peer.clientName,
            completedPercent: peer.progress * 100,
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
          throw new Error();
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

  async reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .reannounceTorrents(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .removeTorrents(hashes, deleteData)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsInitialSeeding(): Promise<void> {
    throw new Error('Transmission does not support this feature.');
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
      .setTorrentsProperties({
        ids: hashes,
        bandwidthPriority: transmissionPriority,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsSequential(): Promise<void> {
    // Transmission maintainers rejected the feature.
    throw new Error('Transmission does not support this feature.');
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    return this.clientRequestManager
      .setTorrentsProperties({ids: hashes, labels: tags})
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    // Remove existing trackers
    await this.clientRequestManager
      .getTorrents(hashes, ['trackers'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((torrents) =>
        Promise.all(
          torrents.map(async (torrent, index) => {
            await this.clientRequestManager
              .setTorrentsProperties({
                ids: hashes[index],
                trackerRemove: torrent.trackers.map((tracker) => tracker.id),
              })
              .then(this.processClientRequestSuccess, this.processClientRequestError)
              .catch(() => undefined);
          }),
        ),
      );

    return this.clientRequestManager
      .setTorrentsProperties({ids: hashes, trackerAdd: trackers})
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
        'comment',
        'haveValid',
        'addedDate',
        'dateCreated',
        'doneDate',
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
        'activityDate',
      ])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (torrents) => {
        this.emit('PROCESS_TORRENT_LIST_START');

        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            torrents.map(async (torrent) => {
              const percentComplete = (torrent.haveValid / torrent.totalSize) * 100;
              const ratio =
                torrent.downloadedEver === 0
                  ? torrent.uploadedEver / torrent.totalSize
                  : torrent.uploadedEver / torrent.downloadedEver;
              const trackerURIs = getDomainsFromURLs(torrent.trackers.map((tracker) => tracker.announce));
              const status = torrentPropertiesUtil.getTorrentStatus(torrent);

              const torrentProperties: TorrentProperties = {
                hash: torrent.hashString.toUpperCase(),
                name: torrent.name,
                comment: torrent.comment,
                bytesDone: torrent.haveValid,
                dateActive: torrent.rateDownload > 0 || torrent.rateUpload > 0 ? -1 : torrent.activityDate,
                dateAdded: torrent.addedDate,
                dateCreated: torrent.dateCreated,
                dateFinished: torrent.doneDate,
                directory: torrent.downloadDir,
                downRate: torrent.rateDownload,
                downTotal: torrent.downloadedEver,
                upRate: torrent.rateUpload,
                upTotal: torrent.uploadedEver,
                eta: torrent.eta > 0 ? torrent.eta : -1,
                isPrivate: torrent.isPrivate,
                isInitialSeeding: false,
                isSequential: false,
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

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    return this.clientRequestManager
      .getSessionProperties(['config-dir'])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((properties) => ({path: path.join(properties['config-dir'], 'torrents'), case: 'lower'}));
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
          throttleGlobalDownSpeed: properties['speed-limit-down-enabled'] ? properties['speed-limit-down'] * 1024 : 0,
          throttleGlobalUpSpeed: properties['speed-limit-up-enabled'] ? properties['speed-limit-up'] * 1024 : 0,
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
    const req: Record<string, string | number | boolean | undefined> = {
      'dht-enabled': settings.dht,
      'download-dir': settings.directoryDefault,
      'peer-port-random-on-start': settings.networkPortRandom,
      'pex-enabled': settings.protocolPex,
    };

    if (typeof settings.networkPortRandom !== 'undefined') {
      req['peer-port'] = Number(settings.networkPortRange?.split('-')[0]);
    }

    if (typeof settings.throttleMaxUploadsGlobal === 'undefined') {
      req['seed-queue-enabled'] = settings.throttleMaxUploadsGlobal !== 0;
      req['seed-queue-size'] = settings.throttleMaxUploadsGlobal;
    }

    if (typeof settings.throttleGlobalUpSpeed !== 'undefined') {
      req['speed-limit-up-enabled'] = settings.throttleGlobalUpSpeed !== 0;
      req['speed-limit-up'] = settings.throttleGlobalUpSpeed / 1024;
    }

    if (typeof settings.throttleGlobalDownSpeed !== 'undefined') {
      req['speed-limit-down-enabled'] = settings.throttleGlobalDownSpeed !== 0;
      req['speed-limit-down'] = settings.throttleGlobalDownSpeed / 1024;
    }

    return this.clientRequestManager
      .setSessionProperties(req)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async testGateway(): Promise<void> {
    return this.clientRequestManager
      .updateSessionID()
      .then(() => this.processClientRequestSuccess(undefined), this.processClientRequestError);
  }
}

export default TransmissionClientGatewayService;
