import fs from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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
import parseTorrent from 'parse-torrent';

import {TorrentPriority} from '../../../shared/types/Torrent';
import {TorrentContentPriority} from '../../../shared/types/TorrentContent';
import {TorrentTrackerType} from '../../../shared/types/TorrentTracker';
import {fetchUrls} from '../../util/fetchUtil';
import {getDomainsFromURLs} from '../../util/torrentPropertiesUtil';
import ClientGatewayService from '../clientGatewayService';
import ClientRequestManager from './clientRequestManager';
import {QBittorrentTorrentContentPriority, QBittorrentTorrentTrackerStatus} from './types/QBittorrentTorrentsMethods';
import {isApiVersionAtLeast} from './util/apiVersionCheck';
import {
  getTorrentPeerPropertiesFromFlags,
  getTorrentStatusFromState,
  getTorrentTrackerTypeFromURL,
} from './util/torrentPropertiesUtil';

class QBittorrentClientGatewayService extends ClientGatewayService {
  private clientRequestManager = new ClientRequestManager(this.user.client as QBittorrentConnectionSettings);
  private cachedProperties: Record<
    string,
    Pick<TorrentProperties, 'comment' | 'dateCreated' | 'isPrivate' | 'trackerURIs'>
  > = {};

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
    const fileBuffers: Buffer[] = [];

    const torrentHashes: string[] = (
      await Promise.all(
        files.map(async (file) => {
          try {
            const fileBuffer = Buffer.from(file, 'base64');

            const {infoHash} = parseTorrent(fileBuffer);
            fileBuffers.push(fileBuffer);

            return infoHash;
          } catch {
            return;
          }
        }),
      )
    ).filter((hash) => hash) as string[];

    if (torrentHashes[0] == null) {
      throw new Error();
    }

    const method = isApiVersionAtLeast(await this.clientRequestManager.apiVersion, '2.11.0') ? 'stopped' : 'paused';
    await this.clientRequestManager
      .torrentsAddFiles(fileBuffers, {
        savepath: destination,
        tags: tags.join(','),
        [method]: !start,
        root_folder: !isBasePath,
        contentLayout: isBasePath ? 'NoSubfolder' : undefined,
        sequentialDownload: isSequential,
        skip_checking: isCompleted,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);

    await this.setTorrentsInitialSeeding({hashes: torrentHashes, isInitialSeeding});

    return torrentHashes;
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

    const method = isApiVersionAtLeast(await this.clientRequestManager.apiVersion, '2.11.0') ? 'stopped' : 'paused';
    await this.clientRequestManager
      .torrentsAddURLs(urls, {
        savepath: destination,
        tags: tags.join(','),
        [method]: !start,
        root_folder: !isBasePath,
        contentLayout: isBasePath ? 'NoSubfolder' : undefined,
        sequentialDownload: isSequential,
        skip_checking: isCompleted,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);

    if (files[0]) {
      return this.addTorrentsByFile({
        files: files.map((file) => file.toString('base64')) as [string, ...string[]],
        destination,
        tags,
        isBasePath,
        isCompleted,
        isInitialSeeding,
        isSequential,
        start,
      });
    }

    return [];
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsRecheck(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager
      .getTorrentContents(hash)
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((contents) => {
        return contents.map((content, index) => {
          let priority = TorrentContentPriority.NORMAL;

          switch (content.priority) {
            case QBittorrentTorrentContentPriority.DO_NOT_DOWNLOAD:
              priority = TorrentContentPriority.DO_NOT_DOWNLOAD;
              break;
            case QBittorrentTorrentContentPriority.HIGH:
            case QBittorrentTorrentContentPriority.MAXIMUM:
              priority = TorrentContentPriority.HIGH;
              break;
            default:
              break;
          }

          return {
            index,
            path: content.name,
            filename: content.name.split('/').pop() || '',
            percentComplete: content.progress * 100,
            priority,
            sizeBytes: content.size,
          };
        });
      });
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager
      .syncTorrentPeers(hash)
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((peers) => {
        return Object.keys(peers).reduce((accumulator: Array<TorrentPeer>, ip_and_port) => {
          const peer = peers[ip_and_port];

          // Only displays connected peers
          if (!peer.flags.includes('D') && !peer.flags.includes('U')) {
            return accumulator;
          }

          const properties = getTorrentPeerPropertiesFromFlags(peer.flags);
          accumulator.push({
            address: peer.ip,
            country: peer.country_code,
            clientVersion: peer.client,
            completedPercent: peer.progress * 100,
            downloadRate: peer.dl_speed,
            uploadRate: peer.up_speed,
            isEncrypted: properties.isEncrypted,
            isIncoming: properties.isIncoming,
          });

          return accumulator;
        }, []);
      });
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager
      .getTorrentTrackers(hash)
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((trackers) => {
        return trackers
          .filter((tracker) => tracker.status !== QBittorrentTorrentTrackerStatus.DISABLED)
          .map((tracker) => {
            return {
              url: tracker.url,
              type: getTorrentTrackerTypeFromURL(tracker.url),
            };
          });
      });
  }

  async moveTorrents({hashes, destination}: MoveTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsSetLocation(hashes, destination)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsReannounce(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsDelete(hashes, deleteData || false)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsInitialSeeding({hashes, isInitialSeeding}: SetTorrentsInitialSeedingOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsSetSuperSeeding(hashes, isInitialSeeding)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsPriority({hashes, priority}: SetTorrentsPriorityOptions): Promise<void> {
    // TODO: qBittorrent uses queue and priority here has a different meaning
    switch (priority) {
      case TorrentPriority.DO_NOT_DOWNLOAD:
        return this.stopTorrents({hashes});
      case TorrentPriority.LOW:
        return this.clientRequestManager
          .torrentsSetBottomPrio(hashes)
          .then(this.processClientRequestSuccess, this.processClientRequestError);
      case TorrentPriority.HIGH:
        return this.clientRequestManager
          .torrentsSetTopPrio(hashes)
          .then(this.processClientRequestSuccess, this.processClientRequestError);
      default:
        return undefined;
    }
  }

  async setTorrentsSequential({hashes, isSequential}: SetTorrentsSequentialOptions): Promise<void> {
    // qBittorrent API is not idempotent...
    // get torrent list so we know if the state needs to be flipped
    const {torrents} = await this.fetchTorrentList();

    const flipNeeded: Array<string> = hashes.filter((hash) => {
      const currentIsSequential = torrents[hash.toUpperCase()]?.isSequential;
      return currentIsSequential != null && currentIsSequential !== isSequential;
    });

    return this.clientRequestManager
      .torrentsToggleSequentialDownload(flipNeeded)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    return this.clientRequestManager.torrentsRemoveTags(hashes).then(() => {
      this.clientRequestManager
        .torrentsAddTags(hashes, tags)
        .then(this.processClientRequestSuccess, this.processClientRequestError);
    });
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    return Promise.all(
      hashes.map(async (hash) => {
        const currentTrackerURLs = await this.getTorrentTrackers(hash).then((currentTrackers) =>
          currentTrackers.filter((tracker) => tracker.type !== TorrentTrackerType.DHT).map((tracker) => tracker.url),
        );

        await this.clientRequestManager.torrentsRemoveTrackers(hash, currentTrackerURLs);

        return this.clientRequestManager
          .torrentsAddTrackers(hash, trackers)
          .then(this.processClientRequestSuccess, this.processClientRequestError)
          .then(() => delete this.cachedProperties[hash.toLowerCase()]);
      }),
    ).then(() => undefined);
  }

  async setTorrentContentsPriority(
    hash: string,
    {indices, priority}: SetTorrentContentsPropertiesOptions,
  ): Promise<void> {
    let qbFilePriority = QBittorrentTorrentContentPriority.NORMAL;

    switch (priority) {
      case TorrentContentPriority.DO_NOT_DOWNLOAD:
        qbFilePriority = QBittorrentTorrentContentPriority.DO_NOT_DOWNLOAD;
        break;
      case TorrentContentPriority.HIGH:
        qbFilePriority = QBittorrentTorrentContentPriority.HIGH;
        break;
      default:
        break;
    }

    return this.clientRequestManager
      .torrentsFilePrio(hash, indices, qbFilePriority)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsResume(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsPause(hashes)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .getTorrentInfos()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (infos) => {
        this.emit('PROCESS_TORRENT_LIST_START');

        // qBittorrent can not handle requests in a highly concurrent way.
        for await (const {hash} of infos) {
          if (this.cachedProperties[hash] == null) {
            const properties = await this.clientRequestManager.getTorrentProperties(hash).catch(() => undefined);
            const trackers = await this.clientRequestManager.getTorrentTrackers(hash).catch(() => undefined);

            if (properties != null && trackers != null && Array.isArray(trackers)) {
              this.cachedProperties[hash] = {
                comment: properties?.comment,
                dateCreated: properties?.creation_date,
                isPrivate: trackers[0]?.msg.includes('is private'),
                trackerURIs: getDomainsFromURLs(
                  trackers
                    .map((tracker) => tracker.url)
                    .filter((url) => getTorrentTrackerTypeFromURL(url) !== TorrentTrackerType.DHT),
                ),
              };
            }
          }
        }

        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            infos.map(async (info) => {
              const {
                comment = '',
                dateCreated = 0,
                isPrivate = false,
                trackerURIs = [],
              } = this.cachedProperties[info.hash] || {};

              const torrentProperties: TorrentProperties = {
                bytesDone: info.completed,
                comment: comment,
                dateActive: info.dlspeed > 0 || info.upspeed > 0 ? -1 : info.last_activity,
                dateAdded: info.added_on,
                dateCreated,
                dateFinished: info.completion_on,
                directory: info.save_path,
                downRate: info.dlspeed,
                downTotal: info.downloaded,
                eta: info.eta >= 8640000 ? -1 : info.eta,
                hash: info.hash.toUpperCase(),
                isPrivate,
                isInitialSeeding: info.super_seeding,
                isSequential: info.seq_dl,
                message: '', // in tracker method
                name: info.name,
                peersConnected: info.num_leechs,
                peersTotal: info.num_incomplete,
                percentComplete: info.progress * 100,
                priority: 1,
                ratio: info.ratio,
                seedsConnected: info.num_seeds,
                seedsTotal: info.num_complete,
                sizeBytes: info.size,
                status: getTorrentStatusFromState(info.state),
                tags: info.tags === '' ? [] : info.tags.split(',').map((tag) => tag.trim()),
                trackerURIs,
                upRate: info.upspeed,
                upTotal: info.uploaded,
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
      .getTransferInfo()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((info) => {
        return {
          downRate: info.dl_info_speed,
          downTotal: info.dl_info_data,
          upRate: info.up_info_speed,
          upTotal: info.up_info_data,
        };
      });
  }

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    // qBittorrent API does not provide session directory.
    // We can only guess with the common locations here.
    switch (process.platform) {
      case 'win32':
        if (process.env.LOCALAPPDATA) {
          return {path: path.join(process.env.LOCALAPPDATA, '\\qBittorrent\\BT_backup'), case: 'lower'};
        }
        return {path: path.join(homedir(), '\\AppData\\Local\\qBittorrent\\BT_backup'), case: 'lower'};
      case 'darwin':
        return {path: path.join(homedir(), '/Library/Application Support/qBittorrent/BT_backup'), case: 'lower'};
      default:
        const legacyPath = path.join(homedir(), '/.local/share/data/qBittorrent/BT_backup');
        try {
          await fs.promises.access(legacyPath);
          return {path: legacyPath, case: 'lower'};
        } catch {
          return {path: path.join(homedir(), '/.local/share/qBittorrent/BT_backup'), case: 'lower'};
        }
    }
  }

  async getClientSettings(): Promise<ClientSettings> {
    return this.clientRequestManager
      .getAppPreferences()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((preferences) => {
        return {
          dht: preferences.dht,
          dhtPort: preferences.listen_port,
          directoryDefault: preferences.save_path.split(',')[0],
          networkHttpMaxOpen: preferences.max_connec,
          networkLocalAddress: [preferences.announce_ip],
          networkMaxOpenFiles: 0,
          networkPortOpen: true,
          networkPortRandom: preferences.random_port,
          networkPortRange: `${preferences.listen_port}`,
          piecesHashOnCompletion: false,
          piecesMemoryMax: 0,
          protocolPex: preferences.pex,
          throttleGlobalDownSpeed: preferences.dl_limit,
          throttleGlobalUpSpeed: preferences.up_limit,
          throttleMaxPeersNormal: 0,
          throttleMaxPeersSeed: 0,
          throttleMaxDownloads: 0,
          throttleMaxDownloadsGlobal: 0,
          throttleMaxUploads: preferences.max_uploads_per_torrent,
          throttleMaxUploadsGlobal: preferences.max_uploads,
          throttleMinPeersNormal: 0,
          throttleMinPeersSeed: 0,
          trackersNumWant: 0,
        };
      });
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    return this.clientRequestManager
      .setAppPreferences({
        dht: settings.dht,
        save_path: settings.directoryDefault,
        max_connec: settings.networkHttpMaxOpen,
        announce_ip: settings.networkLocalAddress ? settings.networkLocalAddress[0] : undefined,
        random_port: settings.networkPortRandom,
        listen_port: settings.networkPortRange ? Number(settings.networkPortRange?.split('-')[0]) : undefined,
        pex: settings.protocolPex,
        dl_limit: settings.throttleGlobalDownSpeed,
        up_limit: settings.throttleGlobalUpSpeed,
        max_uploads_per_torrent: settings.throttleMaxUploads,
        max_uploads: settings.throttleMaxUploadsGlobal,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async testGateway(): Promise<void> {
    return this.clientRequestManager
      .updateConnection()
      .then(() => this.processClientRequestSuccess(undefined), this.processClientRequestError);
  }
}

export default QBittorrentClientGatewayService;
