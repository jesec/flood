import type {ClientSettings} from '@shared/types/ClientSettings';
import type {QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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
  cachedProperties: Record<string, Pick<TorrentProperties, 'dateCreated' | 'isPrivate' | 'trackerURIs'>> = {};

  async addTorrentsByFile({files, destination, isBasePath, start}: AddTorrentByFileOptions): Promise<void> {
    const fileBuffers = files.map((file) => {
      return Buffer.from(file, 'base64');
    });

    // TODO: qBittorrent does not have capability to add tags during add torrents.

    return this.clientRequestManager
      .torrentsAddFiles(fileBuffers, {
        savepath: destination,
        paused: !start,
        root_folder: !isBasePath,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async addTorrentsByURL({urls, destination, isBasePath, start}: AddTorrentByURLOptions): Promise<void> {
    // TODO: qBittorrent does not have capability to add tags during add torrents.

    return this.clientRequestManager
      .torrentsAddURLs(urls, {
        savepath: destination,
        paused: !start,
        root_folder: !isBasePath,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
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
            percentComplete: Math.trunc(content.progress * 100),
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
            completedPercent: Math.trunc(peer.progress * 100),
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

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsDelete(hashes, deleteData || false)
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

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    return this.clientRequestManager
      .torrentsAddTags(hashes, tags)
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    await Promise.all(
      hashes.map((hash) => {
        return this.clientRequestManager
          .torrentsAddTrackers(hash, trackers)
          .then(this.processClientRequestSuccess, this.processClientRequestError)
          .then(() => delete this.cachedProperties[hash]);
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

        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            infos.map(async (info) => {
              if (this.cachedProperties[info.hash] == null) {
                const properties = await this.clientRequestManager
                  .getTorrentProperties(info.hash)
                  .catch(() => undefined);
                const trackers = await this.clientRequestManager.getTorrentTrackers(info.hash).catch(() => undefined);

                if (properties != null && trackers != null && Array.isArray(trackers)) {
                  this.cachedProperties[info.hash] = {
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

              const {dateCreated = 0, isPrivate = false, trackerURIs = []} = this.cachedProperties[info.hash] || {};

              const torrentProperties: TorrentProperties = {
                bytesDone: info.completed,
                dateAdded: info.added_on,
                dateCreated,
                directory: info.save_path,
                downRate: info.dlspeed,
                downTotal: info.downloaded,
                eta: info.eta >= 8640000 ? -1 : info.eta,
                hash: info.hash,
                isPrivate,
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
          // B/s to Kb/s
          throttleGlobalDownMax: preferences.dl_limit / 1024,
          throttleGlobalUpMax: preferences.up_limit / 1024,
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
        // Kb/s to B/s
        dl_limit: settings.throttleGlobalDownMax != null ? settings.throttleGlobalDownMax * 1024 : undefined,
        up_limit: settings.throttleGlobalUpMax != null ? settings.throttleGlobalUpMax * 1024 : undefined,
        max_uploads_per_torrent: settings.throttleMaxUploads,
        max_uploads: settings.throttleMaxUploadsGlobal,
      })
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  async testGateway(): Promise<void> {
    return this.clientRequestManager
      .updateAuthCookie()
      .then(() => this.processClientRequestSuccess(undefined), this.processClientRequestError);
  }
}

export default QBittorrentClientGatewayService;
