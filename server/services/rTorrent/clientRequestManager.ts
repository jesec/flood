import type {RTorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import scgiUtil from './util/scgiUtil';

import type {MultiMethodCalls} from './util/rTorrentMethodCallUtil';

type MethodCallParameters = Array<string | Buffer | MultiMethodCalls>;

class ClientRequestManager {
  connectionSettings: RTorrentConnectionSettings;
  isRequestPending = false;
  lastResponseTimestamp = 0;
  pendingRequests: Array<{
    methodName: string;
    parameters: MethodCallParameters;
    resolve: (value?: Record<string, string>) => void;
    reject: (error?: NodeJS.ErrnoException) => void;
  }> = [];

  constructor(connectionSettings: RTorrentConnectionSettings) {
    this.connectionSettings = connectionSettings;
  }

  handleRequestEnd() {
    this.isRequestPending = false;

    // We avoid initiating any deferred requests until at least 250ms have
    // since the previous response.
    const currentTimestamp = Date.now();
    const timeSinceLastResponse = currentTimestamp - this.lastResponseTimestamp;

    if (timeSinceLastResponse <= 250) {
      const delay = 250 - timeSinceLastResponse;
      setTimeout(this.sendDeferredMethodCall, delay);
      this.lastResponseTimestamp = currentTimestamp + delay;
    } else {
      this.sendDeferredMethodCall();
      this.lastResponseTimestamp = currentTimestamp;
    }
  }

  sendDeferredMethodCall = () => {
    const nextRequest = this.pendingRequests.shift();
    if (nextRequest == null) {
      return;
    }

    this.isRequestPending = true;
    this.sendMethodCall(nextRequest.methodName, nextRequest.parameters).then(nextRequest.resolve, nextRequest.reject);
  };

  sendMethodCall = (methodName: string, parameters: MethodCallParameters) => {
    const connectionMethod =
      this.connectionSettings.type === 'socket'
        ? {
            socketPath: this.connectionSettings.socket,
          }
        : {
            host: this.connectionSettings.host,
            port: this.connectionSettings.port,
          };

    return scgiUtil.methodCall(connectionMethod, methodName, parameters).then(
      (response) => {
        this.handleRequestEnd();
        return response;
      },
      (error) => {
        this.handleRequestEnd();
        throw error;
      },
    );
  };

  methodCall = (methodName: string, parameters: MethodCallParameters) => {
    // We only allow one request at a time.
    if (this.isRequestPending) {
      return new Promise(
        (resolve: (value?: Record<string, string>) => void, reject: (error?: NodeJS.ErrnoException) => void) => {
          this.pendingRequests.push({
            methodName,
            parameters,
            resolve,
            reject,
          });
        },
      );
    }
    this.isRequestPending = true;
    return this.sendMethodCall(methodName, parameters);
  };
}

export default ClientRequestManager;
