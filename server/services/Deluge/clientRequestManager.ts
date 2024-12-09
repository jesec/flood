import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import tls from 'node:tls';
import {deflate, inflate} from 'node:zlib';

import type {DelugeConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import type {
  DelugeCorePreferences,
  DelugeCoreSessionStatuses,
  DelugeCoreTorrentOptions,
  DelugeCoreTorrentStatuses,
  DelugeCoreTorrentTracker,
} from './types/DelugeCoreMethods';
import type {RencodableArray, RencodableData, RencodableObject} from './util/rencode';
import {decode, encode} from './util/rencode';

const DELUGE_RPC_PROTOCOL_VERSION = 0x01;
const protocolVerBuf = Buffer.alloc(1);
protocolVerBuf[0] = DELUGE_RPC_PROTOCOL_VERSION;

enum DelugeRpcResponseType {
  RESPONSE = 1,
  ERROR = 2,
  EVENT = 3,
}

class ClientRequestManager {
  private connectionSettings: DelugeConnectionSettings;
  private requestId = 0;
  private requestQueue: Record<number, [(data: RencodableData) => void, (err: Error) => void]> = {};
  private rpc?: Promise<tls.TLSSocket>;
  private rpcWithAuth?: Promise<tls.TLSSocket>;

  private async receive(data: Buffer): Promise<void> {
    const response = decode(data) as RencodableArray;
    switch (response[0]) {
      case DelugeRpcResponseType.RESPONSE: {
        const [, request_id, return_value] = response;
        const [resolve] = this.requestQueue[request_id as number] ?? [,];

        delete this.requestQueue[request_id as number];
        resolve?.(return_value);

        return;
      }
      case DelugeRpcResponseType.ERROR: {
        const [, request_id, exception_type, exception_msg] = response;
        const [, reject] = this.requestQueue[request_id as number] ?? [,];

        delete this.requestQueue[request_id as number];
        reject?.(new Error(`${exception_type}: ${exception_msg}`));

        return;
      }
      case DelugeRpcResponseType.EVENT: {
        return;
      }
      default: {
        return;
      }
    }
  }

  private async methodCall(request: [string, RencodableArray, RencodableObject], auth = true): Promise<RencodableData> {
    const rpc = await (auth ? this.rpcWithAuth : this.rpc);
    if (rpc == undefined) {
      throw new Error('RPC is not connected.');
    }

    const requestId = this.requestId++;

    return await new Promise<RencodableData>((resolve, reject) => {
      deflate(encode([[requestId, ...request]]), (err, payloadBuf) => {
        if (err) {
          reject(err);
          return;
        }

        const {length} = payloadBuf;
        if (length > 0xff_ff_ff_ff) {
          reject(new Error('Payload is too large.'));
          return;
        }

        const lengthBuf = Buffer.alloc(4);
        lengthBuf.writeUInt32BE(length, 0);

        this.requestQueue[requestId] = [resolve, reject];
        rpc.write(Buffer.concat([protocolVerBuf, lengthBuf, payloadBuf]));
      });
    });
  }

  private connect(): Promise<tls.TLSSocket> {
    return new Promise<tls.TLSSocket>((resolve, reject) => {
      Object.keys(this.requestQueue).forEach((id) => {
        const idAsNumber = Number(id);
        const [, rejectRequest] = this.requestQueue[idAsNumber];
        rejectRequest(new Error('Session is no longer active.'));
      });

      this.requestId = 0;
      this.requestQueue = {};

      let rpcBufferSize = 0;
      let rpcBuffer: Buffer | null = null;

      const tlsSocket = tls.connect({
        host: this.connectionSettings.host,
        port: this.connectionSettings.port,
        timeout: 30,
        rejectUnauthorized: false,
      });

      const handleError = (e: Error) => {
        tlsSocket.destroy();
        this.rpcWithAuth = this.rpc = Promise.reject();
        reject(e);
      };

      tlsSocket.once('error', handleError);
      tlsSocket.once('close', handleError);

      tlsSocket.on('secureConnect', () => {
        tlsSocket.on('data', (chunk: Buffer) => {
          if (rpcBuffer != null) {
            rpcBuffer = Buffer.concat(
              [rpcBuffer, chunk],
              rpcBufferSize <= rpcBuffer.length + chunk.length ? rpcBufferSize : undefined,
            );
          } else {
            if (chunk[0] !== DELUGE_RPC_PROTOCOL_VERSION) {
              handleError(new Error('Unexpected Deluge RPC version.'));
              return;
            }

            rpcBufferSize = chunk.subarray(1, 5).readUInt32BE(0);
            rpcBuffer = chunk.subarray(5);
          }

          if (rpcBuffer.length >= rpcBufferSize) {
            const buf = rpcBuffer;
            rpcBuffer = null;
            rpcBufferSize = 0;
            inflate(buf, (err, data) => {
              if (err) {
                handleError(err);
                return;
              }

              this.receive(data);
            });
          }
        });

        resolve(tlsSocket);
      });
    });
  }

  async coreAddTorrentFile(
    filename: string,
    filedump: string,
    options: Partial<DelugeCoreTorrentOptions>,
  ): Promise<string> {
    return this.methodCall(['core.add_torrent_file', [filename, filedump, options], {}]) as Promise<string>;
  }

  async coreAddTorrentMagnet(uri: string, options: Partial<DelugeCoreTorrentOptions>): Promise<string> {
    return this.methodCall(['core.add_torrent_magnet', [uri, options], {}]) as Promise<string>;
  }

  async coreForceReannounce(torrent_ids: string[]): Promise<void> {
    await this.methodCall(['core.force_reannounce', [torrent_ids.map((id) => id.toLowerCase())], {}]);
  }

  async coreForceRecheck(torrent_ids: string[]): Promise<void> {
    await this.methodCall(['core.force_recheck', [torrent_ids.map((id) => id.toLowerCase())], {}]);
  }

  async coreGetConfigValues<T extends keyof DelugeCorePreferences>(
    keys: Array<T>,
  ): Promise<Pick<DelugeCorePreferences, T>> {
    return this.methodCall(['core.get_config_values', [keys], {}]) as Promise<Pick<DelugeCorePreferences, T>>;
  }

  async coreGetListenPort(): Promise<string> {
    return this.methodCall(['core.get_listen_port', [], {}]) as Promise<string>;
  }

  async coreGetSessionStatus<T extends keyof DelugeCoreSessionStatuses>(
    keys: Array<T>,
  ): Promise<Pick<DelugeCoreSessionStatuses, T>> {
    return this.methodCall(['core.get_session_status', [keys], {}]) as Promise<Pick<DelugeCoreSessionStatuses, T>>;
  }

  async coreGetTorrentStatus<T extends keyof DelugeCoreTorrentStatuses>(
    torrent_id: string,
    keys: Array<T>,
    diff = false,
  ): Promise<Pick<DelugeCoreTorrentStatuses, T>> {
    return this.methodCall(['core.get_torrent_status', [torrent_id.toLowerCase(), keys, diff], {}]) as Promise<
      Pick<DelugeCoreTorrentStatuses, T>
    >;
  }

  async coreGetTorrentsStatus<T extends keyof DelugeCoreTorrentStatuses>(
    keys: Array<T>,
    filter_dict = {},
    diff = false,
  ): Promise<Record<string, Pick<DelugeCoreTorrentStatuses, T>>> {
    return this.methodCall(['core.get_torrents_status', [filter_dict, keys, diff], {}]) as Promise<
      Record<string, Pick<DelugeCoreTorrentStatuses, T>>
    >;
  }

  async coreMoveStorage(torrent_ids: string[], dest: string): Promise<void> {
    await this.methodCall(['core.move_storage', [torrent_ids.map((id) => id.toLowerCase()), dest], {}]);
  }

  async corePauseTorrents(torrent_ids: string[]): Promise<void> {
    await this.methodCall(['core.pause_torrents', [torrent_ids.map((id) => id.toLowerCase())], {}]);
  }

  async coreRemoveTorrents(torrent_ids: string[], remove_data: boolean): Promise<void> {
    await this.methodCall(['core.remove_torrents', [torrent_ids.map((id) => id.toLowerCase()), remove_data], {}]);
  }

  async coreResumeTorrents(torrent_ids: string[]): Promise<void> {
    await this.methodCall(['core.resume_torrents', [torrent_ids.map((id) => id.toLowerCase())], {}]);
  }

  async coreSetConfig(config: Partial<DelugeCorePreferences>): Promise<void> {
    await this.methodCall(['core.set_config', [config], {}]);
  }

  async coreSetTorrentOptions(torrent_ids: string[], options: Partial<DelugeCoreTorrentOptions>): Promise<void> {
    await this.methodCall(['core.set_torrent_options', [torrent_ids.map((id) => id.toLowerCase()), options], {}]);
  }

  async coreSetTorrentTrackers(torrent_ids: string[], trackers: DelugeCoreTorrentTracker[]): Promise<void> {
    await this.methodCall([
      'core.set_torrent_trackers',
      [torrent_ids.map((id) => id.toLowerCase()), trackers as unknown as RencodableObject[]],
      {},
    ]);
  }

  async daemonInfo(): Promise<string> {
    return this.methodCall(['daemon.info', [], {}], false) as Promise<string>;
  }

  async daemonGetMethodList(): Promise<string[]> {
    return this.methodCall(['daemon.get_method_list', [], {}]) as Promise<string[]>;
  }

  async daemonLogin(): Promise<void> {
    const client_version = await this.daemonInfo();

    const {host, username, password} = this.connectionSettings;
    let actualPassword = password;
    if ((host === 'localhost' || host === '127.0.0.1' || host === '::1') && password === '') {
      try {
        actualPassword =
          (await fs.promises.readFile(path.join(os.homedir(), '.config/deluge/auth')))
            .toString('utf-8')
            .split(os.EOL)
            .find((entry) => entry.split(':')[0] === username)
            ?.split(':')[1] ?? '';
      } catch {
        // do nothing.
      }
    }

    await this.methodCall(['daemon.login', [username, actualPassword], {client_version}], false);
  }

  async reconnect(): Promise<void> {
    await (this.rpcWithAuth = (this.rpc = this.connect()).then((rpc) => this.daemonLogin().then(() => rpc)));
  }

  constructor(connectionSettings: DelugeConnectionSettings) {
    this.connectionSettings = connectionSettings;
    this.reconnect().catch(() => undefined);
  }
}

export default ClientRequestManager;
