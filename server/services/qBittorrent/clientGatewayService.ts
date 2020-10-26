import crypto from 'crypto';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {ClientConnectionSettings, QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentList, TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
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

import ClientGatewayService from '../interfaces/clientGatewayService';
import ClientRequestManager from './clientRequestManager';
import formatUtil from '../../../shared/util/formatUtil';
import {getDomainsFromURLs} from '../../util/torrentPropertiesUtil';
import {
  getTorrentPeerPropertiesFromFlags,
  getTorrentStatusFromState,
  getTorrentTrackerTypeFromURL,
} from './util/torrentPropertiesUtil';
import {QBittorrentTorrentContentPriority, QBittorrentTorrentTrackerStatus} from './types/QBittorrentTorrentsMethods';
import {TorrentContentPriority} from '../../../shared/types/TorrentContent';
import {TorrentPriority} from '../../../shared/types/Torrent';
import {TorrentTrackerType} from '../../../shared/types/TorrentTracker';

class QBittorrentClientGatewayService extends ClientGatewayService {
  clientRequestManager = new ClientRequestManager(this.user.client as QBittorrentConnectionSettings);
  cachedTrackerURIs: Record<string, Array<string>> = {};

  async addTorrentsByFile({files, destination, isBasePath, start}: AddTorrentByFileOptions): Promise<void> {
    const fileBuffers = files.map((file) => {
      return Buffer.from(file, 'base64');
    });

    // TODO: qBittorrent does not have capability to add tags during add torrents.

    return this.clientRequestManager.torrentsAddFiles(fileBuffers, {
      savepath: destination,
      paused: !start,
      root_folder: !isBasePath,
    });
  }

  async addTorrentsByURL({urls, destination, isBasePath, start}: AddTorrentByURLOptions): Promise<void> {
    // TODO: qBittorrent does not have capability to add tags during add torrents.

    return this.clientRequestManager.torrentsAddURLs(urls, {
      savepath: destination,
      paused: !start,
      root_folder: !isBasePath,
    });
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    return this.clientRequestManager.torrentsRecheck(hashes);
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager.getTorrentContents(hash).then((contents) => {
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
          percentComplete: Math.trunc(content.progress * 100),
          priority,
          sizeBytes: content.size,
        };
      });
    });
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager.syncTorrentPeers(hash).then((peers) => {
      return Object.keys(peers).reduce((accumulator: Array<TorrentPeer>, ip_and_port) => {
        const peer = peers[ip_and_port];

        // Only displays connected peers
        if (!peer.flags.includes('D')) {
          return accumulator;
        }

        const properties = getTorrentPeerPropertiesFromFlags(peer.flags);
        accumulator.push({
          country: peer.country_code,
          address: peer.ip,
          completedPercent: Math.trunc(peer.progress * 100),
          clientVersion: peer.client,
          downloadRate: peer.dl_speed,
          downloadTotal: peer.downloaded,
          uploadRate: peer.up_speed,
          uploadTotal: peer.uploaded,
          id: crypto.createHash('sha1').update(ip_and_port).digest('base64'),
          peerRate: 0,
          peerTotal: 0,
          isEncrypted: properties.isEncrypted,
          isIncoming: properties.isIncoming,
        });

        return accumulator;
      }, []);
    });
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager.getTorrentTrackers(hash).then((trackers) => {
      return trackers.map((tracker, index) => {
        return {
          index,
          id: crypto.createHash('sha1').update(tracker.url).digest('base64'),
          url: tracker.url,
          type: getTorrentTrackerTypeFromURL(tracker.url),
          group: tracker.tier,
          minInterval: 0,
          normalInterval: 0,
          isEnabled: tracker.status !== QBittorrentTorrentTrackerStatus.DISABLED,
        };
      });
    });
  }

  async moveTorrents({hashes, destination}: MoveTorrentsOptions): Promise<void> {
    return this.clientRequestManager.torrentsSetLocation(hashes, destination);
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return this.clientRequestManager.torrentsDelete(hashes, deleteData || false);
  }

  async setTorrentsPriority({hashes, priority}: SetTorrentsPriorityOptions): Promise<void> {
    // TODO: qBittorrent uses queue and priority here has a different meaning
    switch (priority) {
      case TorrentPriority.DO_NOT_DOWNLOAD:
        return this.stopTorrents({hashes});
      case TorrentPriority.LOW:
        return this.clientRequestManager.torrentsSetBottomPrio(hashes);
      case TorrentPriority.HIGH:
        return this.clientRequestManager.torrentsSetTopPrio(hashes);
      default:
        return undefined;
    }
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    return this.clientRequestManager.torrentsAddTags(hashes, tags);
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) => {
        return this.clientRequestManager
          .torrentsAddTrackers(hash, trackers)
          .then(() => delete this.cachedTrackerURIs[hash]);
      }),
    );
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

    return this.clientRequestManager.torrentsFilePrio(hash, indices, qbFilePriority);
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    return this.clientRequestManager.torrentsResume(hashes);
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    return this.clientRequestManager.torrentsPause(hashes);
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .getTorrentInfos()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then(async (infos) => {
        this.emit('PROCESS_TORRENT_LIST_START');
        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            infos.map(async (info) => {
              if (this.cachedTrackerURIs[info.hash] == null) {
                const trackerURLs =
                  (await this.getTorrentTrackers(info.hash).then(
                    (trackers) =>
                      trackers
                        .filter((tracker) => tracker.type !== TorrentTrackerType.DHT)
                        .map((tracker) => tracker.url),
                    () => {
                      // do nothing.
                    },
                  )) || [];
                this.cachedTrackerURIs[info.hash] = getDomainsFromURLs(trackerURLs);
              }

              const torrentProperties: TorrentProperties = {
                baseDirectory: info.save_path,
                baseFilename: info.name,
                basePath: info.save_path,
                bytesDone: info.completed,
                dateAdded: info.added_on,
                dateCreated: 0, // need properties
                directory: info.save_path,
                downRate: info.dlspeed,
                downTotal: info.downloaded,
                eta: info.eta === -1 ? -1 : formatUtil.secondsToDuration(info.eta),
                hash: info.hash,
                isMultiFile: false,
                isPrivate: false,
                message: '', // in tracker method
                name: info.name,
                peersConnected: info.num_leechs,
                peersTotal: info.num_incomplete,
                percentComplete: Math.trunc(info.progress * 100),
                priority: 1,
                ratio: info.ratio,
                seedsConnected: info.num_seeds,
                seedsTotal: info.num_complete,
                sizeBytes: info.size,
                status: getTorrentStatusFromState(info.state),
                tags: info.tags === '' ? [] : info.tags.split(','),
                trackerURIs: this.cachedTrackerURIs[info.hash] || [],
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
        this.emit('PROCESS_TRANSFER_RATE_START');
        return {
          downRate: info.dl_info_speed,
          downThrottle: info.dl_rate_limit,
          downTotal: info.dl_info_data,
          upRate: info.up_info_speed,
          upThrottle: info.up_rate_limit,
          upTotal: info.up_info_data,
        };
      });
  }

  async getClientSettings(): Promise<ClientSettings> {
    return this.clientRequestManager
      .getAppPreferences()
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .then((preferences) => {
        return {
          dht: preferences.dht,
          dhtPort: preferences.listen_port,
          dhtStats: {
            active: 0,
            buckets: 0,
            bytes_read: 0,
            bytes_written: 0,
            cycle: 0,
            errors_caught: 0,
            errors_received: 0,
            nodes: 0,
            peers: 0,
            peers_max: 0,
            queries_received: 0,
            queries_sent: 0,
            replies_received: 0,
            throttle: '',
            torrents: 0,
          },
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
          throttleGlobalDownMax: preferences.dl_limit,
          throttleGlobalUpMax: preferences.up_limit,
          throttleMaxPeersNormal: 0,
          throttleMaxPeersSeed: 0,
          throttleMaxDownloads: 0,
          throttleMaxDownloadsDiv: 0,
          throttleMaxDownloadsGlobal: 0,
          throttleMaxUploads: preferences.max_uploads_per_torrent,
          throttleMaxUploadsDiv: 0,
          throttleMaxUploadsGlobal: preferences.max_uploads,
          throttleMinPeersNormal: 0,
          throttleMinPeersSeed: 0,
          trackersNumWant: 0,
        };
      });
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    return this.clientRequestManager.setAppPreferences({
      dht: settings.dht,
      save_path: settings.directoryDefault,
      max_connec: settings.networkHttpMaxOpen,
      announce_ip: settings.networkLocalAddress ? settings.networkLocalAddress[0] : undefined,
      random_port: settings.networkPortRandom,
      listen_port: settings.networkPortRange ? Number(settings.networkPortRange?.split('-')[0]) : undefined,
      pex: settings.protocolPex,
      dl_limit: settings.throttleGlobalDownMax,
      up_limit: settings.throttleGlobalUpMax,
      max_uploads_per_torrent: settings.throttleMaxUploads,
      max_uploads: settings.throttleMaxUploadsGlobal,
    });
  }

  async testGateway(clientSettings?: ClientConnectionSettings): Promise<void> {
    if (clientSettings != null && clientSettings.client !== 'qBittorrent') {
      return;
    }

    if (!(await this.clientRequestManager.authenticate(clientSettings))) {
      throw new Error();
    }
  }
}

export default QBittorrentClientGatewayService;
