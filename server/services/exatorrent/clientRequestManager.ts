import type {ExatorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import WebSocket from 'ws';

import {
  ExatorrentApiResponse,
  ExatorrentDataApiResponse,
  ExatorrentPeerConn,
  ExatorrentStatusApiResponse,
  ExatorrentTorrent,
  ExatorrentTorrentFile,
} from './types/ExatorrentCoreMethods';

class ClientRequestManager {
  private connectionSettings: ExatorrentConnectionSettings;
  private ws: WebSocket | null = null;
  private mutex: Promise<ExatorrentApiResponse> = Promise.resolve({} as ExatorrentApiResponse);

  constructor(connectionSettings: ExatorrentConnectionSettings) {
    this.connectionSettings = connectionSettings;
  }

  async addMagnet(magnet: string, dontStart: boolean): Promise<string> {
    const response = (await this.sendCommandWithResponse('addmagnet', 'resp', {
      data1: magnet,
      data2: dontStart.toString(),
    })) as ExatorrentStatusApiResponse;
    return response.infohash;
  }

  async addTorrent(torrent: string, dontStart: boolean): Promise<string> {
    const response = (await this.sendCommandWithResponse('addtorrent', 'resp', {
      data1: torrent,
      data2: dontStart.toString(),
    })) as ExatorrentStatusApiResponse;
    return response.infohash;
  }

  async startTorrent(hash: string): Promise<void> {
    await this.sendCommandWithResponse('starttorrent', 'resp', {data1: hash, aop: 1});
  }

  async stopTorrent(hash: string): Promise<void> {
    await this.sendCommand('stoptorrent', {data1: hash, aop: 1});
  }

  async deletetorrent(hash: string): Promise<void> {
    await this.sendCommand('deletetorrent', {data1: hash, aop: 1});
  }

  async removeTorrent(hash: string): Promise<void> {
    await this.sendCommand('removetorrent', {data1: hash, aop: 1});
  }

  async getTorrentFiles(hash: string): Promise<ExatorrentTorrentFile[]> {
    const response = (await this.sendCommandWithResponse('gettorrentfiles', 'torrentfiles', {
      data1: hash,
    })) as ExatorrentDataApiResponse;
    return response.data as ExatorrentTorrentFile[];
  }

  async getTorrents(): Promise<ExatorrentTorrent[]> {
    const response = (await this.sendCommandWithResponse('listalltorrents', 'torrentstream', {
      aop: 1,
    })) as ExatorrentDataApiResponse;
    return response.data as ExatorrentTorrent[];
  }

  async getStatus(): Promise<string> {
    const response = (await this.sendCommandWithResponse('torcstatus', 'torcstatus', {
      aop: 1,
    })) as ExatorrentDataApiResponse;
    return response.data as string;
  }

  async getTorrentPeerConns(hash: string): Promise<ExatorrentPeerConn[]> {
    const response = (await this.sendCommandWithResponse('gettorrentpeerconns', 'torrentpeerconns', {
      data1: hash,
    })) as ExatorrentDataApiResponse;
    return response.data as ExatorrentPeerConn[];
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

  private async sendCommand(command: string, args: object): Promise<void> {
    while (!this.ws?.readyState) {
      await this.reconnect();
    }

    const request = {
      command,
      ...args,
    };

    this.ws.send(JSON.stringify(request));
  }

  private async sendCommandWithResponse(
    command: string,
    receiveType: string,
    args: object,
  ): Promise<ExatorrentApiResponse> {
    await this.mutex.catch();

    await this.sendCommand(command, args);

    this.mutex = new Promise((resolve, reject) => {
      let resolved = false;
      this.ws?.on('message', (data) => {
        const response = JSON.parse(data.toString());
        resolved = true;
        if (response.state === 'error') {
          console.error(response.message);
          reject(new Error(response.message));
        } else if (response.type === receiveType) {
          resolve(response);
        } else {
          console.warn('Unexpected response type:', response.type, ' expected:', receiveType);
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
