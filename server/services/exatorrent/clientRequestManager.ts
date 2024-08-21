import WebSocket from 'ws';

import type {ExatorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import {ExatorrentPeerConn, ExatorrentTorrent, ExatorrentTorrentFile} from './types/ExatorrentCoreMethods';

class ClientRequestManager {
  private connectionSettings: ExatorrentConnectionSettings;
  private ws: WebSocket | null = null;
  private mutex: Promise<any> = Promise.resolve();

  constructor(connectionSettings: ExatorrentConnectionSettings) {
    this.connectionSettings = connectionSettings;
  }

  async addMagnet(magnet: string, dontStart: boolean): Promise<string> {
    return (await this.methodCall('addmagnet', 'resp', {data1: magnet, data2: dontStart.toString()})).infohash;
  }

  async addTorrent(torrent: string, dontStart: boolean): Promise<string> {
    return (await this.methodCall('addtorrent', 'resp', {data1: torrent, data2: dontStart.toString()})).infohash;
  }

  async startTorrent(hash: string): Promise<void> {
    await this.methodCall('starttorrent', 'resp', {data1: hash, aop: 1});
  }

  async stopTorrent(hash: string): Promise<void> {
    await this.methodCall('stoptorrent', null, {data1: hash, aop: 1});
  }

  async deletetorrent(hash: string): Promise<void> {
    await this.methodCall('deletetorrent', null, {data1: hash, aop: 1});
  }

  async removeTorrent(hash: string): Promise<void> {
    await this.methodCall('removetorrent', null, {data1: hash, aop: 1});
  }

  async getTorrentFiles(hash: string): Promise<ExatorrentTorrentFile[]> {
    return (await this.methodCall('gettorrentfiles', 'torrentfiles', {data1: hash})).data as ExatorrentTorrentFile[];
  }

  async getTorrents(): Promise<ExatorrentTorrent[]> {
    return (await this.methodCall('listalltorrents', 'torrentstream', {aop: 1})).data as ExatorrentTorrent[];
  }

  async getStatus(): Promise<string> {
    return (await this.methodCall('torcstatus', 'torcstatus', {aop: 1})).data as string;
  }

  async getTorrentPeerConns(hash: string): Promise<ExatorrentPeerConn[]> {
    return (await this.methodCall('gettorrentpeerconns', 'torrentpeerconns', {data1: hash}))
      .data as ExatorrentPeerConn[];
  }

  async reconnect(): Promise<void> {
    this.ws = await this.connect();
  }

  async destroy(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private async methodCall(command: string, receiveType: string | null, args: Object = {}): Promise<any> {
    await this.mutex.catch(() => {});

    while (!this.ws?.readyState) {
      await this.reconnect();
    }

    const request = {
      command,
      ...args,
    };

    this.ws.send(JSON.stringify(request));

    if (receiveType === null) {
      return;
    }

    this.mutex = new Promise((resolve, reject) => {
      let resolved = false;
      this.ws!.on('message', (data) => {
        const response = JSON.parse(data.toString());
        resolved = true;
        if (response.state === 'error') {
          reject(new Error(response.message));
        } else if (response.type === receiveType) {
          resolve(response);
        } else {
          resolved = false;
        }
        if (resolved) this.ws?.removeAllListeners('message');
      });
      setTimeout(() => {
        if (resolved) return;
        this.destroy();
        reject(new Error('Request timeout'));
      }, 3000);
    });

    return this.mutex;
  }

  private connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://${this.connectionSettings.host}:${this.connectionSettings.port}/api/socket`, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.connectionSettings.username}:${this.connectionSettings.password}`,
          ).toString('base64')}`,
        },
      });

      ws.on('open', () => {
        this.ws = ws;
        resolve(ws);
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });
  }
}

export default ClientRequestManager;
