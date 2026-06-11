import type {NeptuneConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import {NeptuneClient} from './neptune-client';

class ClientRequestManager {
  private client: NeptuneClient;

  constructor(connectionSettings: NeptuneConnectionSettings) {
    this.client = new NeptuneClient(connectionSettings.url, connectionSettings.token);
  }

  async testConnection(): Promise<void> {
    await this.client.call('system.ping');
  }

  async getTorrentList() {
    return this.client.call('torrent.list');
  }

  async getTransferSummary() {
    return this.client.call('transfer_summary');
  }

  async addTorrent(
    torrentFile: string,
    downloadDir?: string,
    tags?: string[],
    isBaseDir?: boolean,
    skipHashCheck?: boolean,
  ) {
    return this.client.call('torrent.add', {
      torrent_file: torrentFile,
      download_dir: downloadDir,
      tags,
      is_base_dir: isBaseDir,
      skip_hash_check: skipHashCheck,
    });
  }

  async removeTorrent(infoHash: string, deleteData = false) {
    await this.client.call('torrent.remove', {info_hash: infoHash, delete_data: deleteData});
  }

  async startTorrent(infoHash: string) {
    await this.client.call('torrent.start', {info_hash: infoHash});
  }

  async stopTorrent(infoHash: string) {
    await this.client.call('torrent.stop', {info_hash: infoHash});
  }

  async recheckTorrent(infoHash: string) {
    await this.client.call('torrent.recheck', {info_hash: infoHash});
  }

  async getTorrentFiles(infoHash: string) {
    return this.client.call('torrent.files', {info_hash: infoHash});
  }

  async getTorrentPeers(infoHash: string) {
    return this.client.call('torrent.peers', {info_hash: infoHash});
  }

  async getTorrentTrackers(infoHash: string) {
    return this.client.call('torrent.trackers', {info_hash: infoHash});
  }

  async addTorrentTracker(infoHash: string, url: string) {
    await this.client.call('torrent.add_tracker', {info_hash: infoHash, url});
  }

  async removeTorrentTracker(infoHash: string, url: string) {
    await this.client.call('torrent.remove_tracker', {info_hash: infoHash, url});
  }

  async addTorrentTags(infoHash: string, tags: string[]) {
    await this.client.call('torrent.add_tags', {info_hash: infoHash, tags});
  }

  async removeTorrentTags(infoHash: string, tags: string[]) {
    await this.client.call('torrent.remove_tags', {info_hash: infoHash, tags});
  }

  async setTorrentFilePriority(infoHash: string, fileIds: number[], priority: number) {
    await this.client.call('torrent.set_file_priority', {info_hash: infoHash, file_ids: fileIds, priority});
  }

  async moveTorrent(infoHash: string, targetBasePath: string) {
    await this.client.call('torrent.move', {info_hash: infoHash, target_base_path: targetBasePath});
  }

  async setDownloadLimit(limit: number) {
    await this.client.call('client.set_download_limit', {limit});
  }

  async setUploadLimit(limit: number) {
    await this.client.call('client.set_upload_limit', {limit});
  }
}

export default ClientRequestManager;
