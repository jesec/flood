import type {TransmissionConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import axios, {AxiosError} from 'axios';

import type {
  TransmissionSessionGetArguments,
  TransmissionSessionProperties,
  TransmissionSessionSetArguments,
  TransmissionSessionStats,
} from './types/TransmissionSessionMethods';
import {
  TransmissionTorrentAddArguments,
  TransmissionTorrentIDs,
  TransmissionTorrentProperties,
  TransmissionTorrentsGetArguments,
  TransmissionTorrentsRemoveArguments,
  TransmissionTorrentsSetArguments,
  TransmissionTorrentsSetLocationArguments,
} from './types/TransmissionTorrentsMethods';

type TransmissionRPCResponse<T = undefined> = {
  result: 'success';
  arguments: T;
} & {
  result: string;
};

class ClientRequestManager {
  private rpcURL: string;
  private authHeader: string;
  private sessionID?: Promise<string | undefined>;

  async fetchSessionID(url = this.rpcURL, authHeader = this.authHeader): Promise<string | undefined> {
    let id: string | undefined = undefined;

    await axios
      .get(url, {
        headers: {
          Authorization: authHeader,
        },
      })
      .catch((err: AxiosError) => {
        if (err.response?.status !== 409) {
          throw err;
        }
        id = err.response?.headers['x-transmission-session-id'];
      });

    return id;
  }

  async updateSessionID(url = this.rpcURL, authHeader = this.authHeader): Promise<void> {
    let authFailed = false;

    this.sessionID = this.fetchSessionID(url, authHeader).catch(() => {
      authFailed = true;
      return undefined;
    });

    await this.sessionID;

    if (authFailed) {
      throw new Error();
    }
  }

  async getRequestHeaders(): Promise<Record<string, string>> {
    const sessionID = await this.sessionID;

    return {
      Authorization: this.authHeader,
      ...(sessionID == null ? {} : {'X-Transmission-Session-Id': sessionID}),
    };
  }

  async getSessionStats(): Promise<TransmissionSessionStats> {
    return axios
      .post<TransmissionRPCResponse<TransmissionSessionStats>>(
        this.rpcURL,
        {method: 'session-stats'},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
        return data.arguments;
      });
  }

  async getSessionProperties<T extends TransmissionSessionGetArguments['fields']>(
    fields: T,
  ): Promise<Pick<TransmissionSessionProperties, T[number]>> {
    const sessionGetArguments: TransmissionSessionGetArguments = {fields};

    return axios
      .post<TransmissionRPCResponse<Pick<TransmissionSessionProperties, T[number]>>>(
        this.rpcURL,
        {method: 'session-get', arguments: sessionGetArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
        return data.arguments;
      });
  }

  async setSessionProperties(properties: TransmissionSessionSetArguments): Promise<void> {
    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'session-set', arguments: properties},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async getTorrents<T extends TransmissionTorrentsGetArguments['fields']>(
    ids: TransmissionTorrentIDs | null,
    fields: T,
  ): Promise<Array<Pick<TransmissionTorrentProperties, T[number]>>> {
    const torrentsGetArguments: TransmissionTorrentsGetArguments = {
      ids: ids || undefined,
      fields,
      format: 'objects',
    };

    return axios
      .post<TransmissionRPCResponse<{torrents: Array<Pick<TransmissionTorrentProperties, T[number]>>}>>(
        this.rpcURL,
        {method: 'torrent-get', arguments: torrentsGetArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success' || data.arguments.torrents == null) {
          throw new Error();
        }
        return data.arguments.torrents;
      });
  }

  async addTorrent(
    args: TransmissionTorrentAddArguments,
  ): Promise<Pick<TransmissionTorrentProperties, 'id' | 'name' | 'hashString'>> {
    return axios
      .post<
        TransmissionRPCResponse<{'torrent-added'?: Pick<TransmissionTorrentProperties, 'id' | 'name' | 'hashString'>}>
      >(
        this.rpcURL,
        {method: 'torrent-add', arguments: args},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success' || !data.arguments['torrent-added']) {
          throw new Error();
        }
        return data.arguments['torrent-added'];
      });
  }

  async reannounceTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'torrent-reannounce', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async setTorrentsProperties(args: TransmissionTorrentsSetArguments): Promise<void> {
    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'torrent-set', arguments: args},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async startTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'torrent-start-now', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async stopTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'torrent-stop', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async verifyTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'torrent-verify', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async removeTorrents(ids: TransmissionTorrentIDs, deleteData?: boolean): Promise<void> {
    const removeTorrentsArguments: TransmissionTorrentsRemoveArguments = {
      ids,
      'delete-local-data': deleteData,
    };

    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {method: 'torrent-remove', arguments: removeTorrentsArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async setTorrentsLocation(ids: TransmissionTorrentIDs, location: string, move?: boolean): Promise<void> {
    const torrentsSetLocationArguments: TransmissionTorrentsSetLocationArguments = {
      ids,
      location,
      move,
    };

    return axios
      .post<TransmissionRPCResponse>(
        this.rpcURL,
        {
          method: 'torrent-set-location',
          arguments: torrentsSetLocationArguments,
        },
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then(({data}) => {
        if (data.result !== 'success') {
          throw new Error();
        }
      });
  }

  constructor(connectionSettings: TransmissionConnectionSettings) {
    const {url, username, password} = connectionSettings;

    this.rpcURL = url;
    this.authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    this.updateSessionID().catch(() => undefined);
    setInterval(() => {
      this.updateSessionID().catch(() => undefined);
    }, 1000 * 60 * 60 * 8);
  }
}

export default ClientRequestManager;
