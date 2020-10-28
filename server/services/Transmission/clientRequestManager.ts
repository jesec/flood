import axios, {AxiosError} from 'axios';

import type {TransmissionConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import type {
  TransmissionSessionGetArguments,
  TransmissionSessionProperties,
  TransmissionSessionSetArguments,
  TransmissionSessionStats,
} from './types/TransmissionSessionMethods';
import {
  TransmissionTorrentIDs,
  TransmissionTorrentProperties,
  TransmissionTorrentAddArguments,
  TransmissionTorrentsGetArguments,
  TransmissionTorrentsRemoveArguments,
  TransmissionTorrentsSetArguments,
  TransmissionTorrentsSetLocationArguments,
} from './types/TransmissionTorrentsMethods';

class ClientRequestManager {
  private rpcURL: string;
  private authHeader: string;
  private sessionID?: Promise<string | undefined>;

  async fetchSessionID(url = this.rpcURL, authHeader = this.authHeader): Promise<string | undefined> {
    return axios
      .get(url, {
        headers: {
          Authorization: authHeader,
        },
      })
      .then<string | undefined>(
        () => {
          return undefined;
        },
        (err: AxiosError) => {
          if (err.response?.status === 409) {
            return err.response?.headers['x-transmission-session-id'];
          }
          throw err;
        },
      );
  }

  async updateSessionID(url = this.rpcURL, authHeader = this.authHeader): Promise<void> {
    let authFailed = false;

    this.sessionID = new Promise((resolve) => {
      this.fetchSessionID(url, authHeader).then(
        (sessionID) => {
          resolve(sessionID);
        },
        () => {
          authFailed = true;
          resolve(undefined);
        },
      );
    });

    await this.sessionID;

    return authFailed ? Promise.reject() : Promise.resolve();
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
      .post(
        this.rpcURL,
        {method: 'session-stats'},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
          throw new Error();
        }
        return res.data.arguments;
      });
  }

  async getSessionProperties<T extends TransmissionSessionGetArguments['fields']>(
    fields: T,
  ): Promise<Pick<TransmissionSessionProperties, T[number]>> {
    const sessionGetArguments: TransmissionSessionGetArguments = {fields};

    return axios
      .post(
        this.rpcURL,
        {method: 'session-get', arguments: sessionGetArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
          throw new Error();
        }
        return res.data.arguments;
      });
  }

  async setSessionProperties(properties: TransmissionSessionSetArguments): Promise<void> {
    return axios
      .post(
        this.rpcURL,
        {method: 'session-set', arguments: properties},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
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
      .post(
        this.rpcURL,
        {method: 'torrent-get', arguments: torrentsGetArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success' || res.data.arguments.torrents == null) {
          throw new Error();
        }
        return res.data.arguments.torrents;
      });
  }

  async addTorrent(
    args: TransmissionTorrentAddArguments,
  ): Promise<Pick<TransmissionTorrentProperties, 'id' | 'name' | 'hashString'>> {
    return axios
      .post(
        this.rpcURL,
        {method: 'torrent-add', arguments: args},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
          throw new Error();
        }
        return res.data.arguments;
      });
  }

  async setTorrentsProperties(args: TransmissionTorrentsSetArguments): Promise<void> {
    return axios
      .post(
        this.rpcURL,
        {method: 'torrent-set', arguments: args},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async startTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post(
        this.rpcURL,
        {method: 'torrent-start-now', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async stopTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post(
        this.rpcURL,
        {method: 'torrent-stop', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
          throw new Error();
        }
      });
  }

  async verifyTorrents(ids: TransmissionTorrentIDs): Promise<void> {
    return axios
      .post(
        this.rpcURL,
        {method: 'torrent-verify', arguments: {ids}},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
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
      .post(
        this.rpcURL,
        {method: 'torrent-remove', arguments: removeTorrentsArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
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
      .post(
        this.rpcURL,
        {method: 'torrent-set-location', arguments: torrentsSetLocationArguments},
        {
          headers: await this.getRequestHeaders(),
        },
      )
      .then((res) => {
        if (res.data.result !== 'success') {
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
