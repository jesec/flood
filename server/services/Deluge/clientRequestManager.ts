import {deflateSync, inflateSync} from 'zlib';
import fs from 'fs';
import os from 'os';
import path from 'path';
import tls from 'tls';

import {decode, encode} from './util/rencode';

import type {DelugeConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import type {RencodableArray, RencodableData, RencodableObject} from './util/rencode';

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
  private rpcBuffer?: Buffer;
  private rpcBufferSize = 0;

  private async receive(data: Buffer): Promise<void> {
    const response = decode(inflateSync(data)) as RencodableArray;
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
    const payloadBuf = deflateSync(encode([[requestId, ...request]]));

    const {length} = payloadBuf;
    if (length > 0xff_ff_ff_ff) {
      throw new Error('Payload is too large.');
    }

    const lengthBuf = Buffer.alloc(4);
    lengthBuf.writeUInt32BE(length, 0);

    return await new Promise<RencodableData>((resolve, reject) => {
      this.requestQueue[requestId] = [resolve, reject];
      rpc.write(Buffer.concat([protocolVerBuf, lengthBuf, payloadBuf]));
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
      this.rpcBufferSize = 0;
      this.rpcBuffer = undefined;

      const tlsSocket = tls.connect({
        host: this.connectionSettings.host,
        port: this.connectionSettings.port,
        timeout: 30,
        rejectUnauthorized: false,
      });

      tlsSocket.on('error', (e) => {
        this.rpcBuffer = undefined;
        this.rpcBufferSize = 0;
        reject(e);
      });

      tlsSocket.on('data', (chunk: Buffer) => {
        if (this.rpcBuffer != null) {
          this.rpcBuffer = Buffer.concat([this.rpcBuffer, chunk], this.rpcBufferSize);
        } else {
          if (chunk[0] !== DELUGE_RPC_PROTOCOL_VERSION) {
            reject(new Error('Unexpected Deluge RPC version.'));
            return;
          }

          this.rpcBufferSize = chunk.slice(1, 5).readUInt32BE(0);
          this.rpcBuffer = chunk.slice(5);
        }

        if (this.rpcBuffer.length >= this.rpcBufferSize) {
          this.receive(this.rpcBuffer);
          this.rpcBufferSize = 0;
          this.rpcBuffer = undefined;
        }
      });

      tlsSocket.on('secureConnect', () => {
        resolve(tlsSocket);
      });
    });
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
          fs
            .readFileSync(path.join(os.homedir(), '.config/deluge/auth'))
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
