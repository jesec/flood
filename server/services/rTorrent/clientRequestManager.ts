import type {NetConnectOpts} from 'node:net';

import type {RTorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import PQueue from 'p-queue';

import {sanitizePath} from '../../util/fileUtil';
import type {MultiMethodCalls} from './util/rTorrentMethodCallUtil';
import {methodCallJSON, methodCallXML} from './util/scgiUtil';

type MethodCallParameters = Array<string | Buffer | MultiMethodCalls>;

class ClientRequestManager {
  queue: PQueue;
  connectionSettings: RTorrentConnectionSettings;
  isJSONCapable = false;

  constructor(connectionSettings: RTorrentConnectionSettings) {
    if (connectionSettings.type === 'socket') {
      this.connectionSettings = {
        ...connectionSettings,
        socket: sanitizePath(connectionSettings.socket),
      };
    } else {
      this.connectionSettings = connectionSettings;
    }

    this.queue = new PQueue({autoStart: true, concurrency: 1});
  }

  sendMethodCall = (methodName: string, parameters: MethodCallParameters) => {
    const connectionOptions: NetConnectOpts =
      this.connectionSettings.type === 'socket'
        ? {
            path: this.connectionSettings.socket,
          }
        : {
            host: this.connectionSettings.host,
            port: this.connectionSettings.port,
          };

    return this.isJSONCapable
      ? methodCallJSON(connectionOptions, methodName, parameters)
      : methodCallXML(connectionOptions, methodName, parameters);
  };

  methodCall = (methodName: string, parameters: MethodCallParameters) => {
    // We only allow one request at a time.
    return this.queue.add(() => this.sendMethodCall(methodName, parameters));
  };
}

export default ClientRequestManager;
