import axios from 'axios';
import FormData from 'form-data';

import type {QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import type {QBittorrentAppPreferences} from './types/QBittorrentAppMethods';
import type {QBittorrentSyncTorrentPeers, QBittorrentTorrentPeers} from './types/QBittorrentSyncMethods';
import type {QBittorrentTransferInfo} from './types/QBittorrentTransferMethods';
import type {
  QBittorrentTorrentContentPriority,
  QBittorrentTorrentContents,
  QBittorrentTorrentInfos,
  QBittorrentTorrentProperties,
  QBittorrentTorrentsAddOptions,
  QBittorrentTorrentTrackers,
} from './types/QBittorrentTorrentsMethods';

class ClientRequestManager {
  private connectionSettings: QBittorrentConnectionSettings;
  private apiBase: string;
  private authCookie?: Promise<string | undefined>;

  private syncRids: {
    torrentPeers: Record<string, Promise<number>>;
  } = {
    torrentPeers: {},
  };

  private syncStates: {
    torrentPeers: Record<string, QBittorrentTorrentPeers>;
  } = {torrentPeers: {}};

  async authenticate(connectionSettings = this.connectionSettings): Promise<string | undefined> {
    const {url, username, password} = connectionSettings;

    return axios
      .get(`${url}/api/v2/auth/login`, {
        params: {
          username,
          password,
        },
      })
      .then((res) => {
        const cookies: Array<string> = res.headers['set-cookie'];

        if (Array.isArray(cookies)) {
          return cookies.filter((cookie) => cookie.includes('SID='))[0];
        }

        return undefined;
      });
  }

  async updateAuthCookie(connectionSettings?: QBittorrentConnectionSettings): Promise<void> {
    let authFailed = false;

    this.authCookie = new Promise((resolve) => {
      this.authenticate(connectionSettings).then(
        (authCookie) => {
          resolve(authCookie);
        },
        () => {
          authFailed = true;
          resolve(undefined);
        },
      );
    });

    await this.authCookie;

    return authFailed ? Promise.reject(new Error()) : Promise.resolve();
  }

  async getAppPreferences(): Promise<QBittorrentAppPreferences> {
    return axios
      .get(`${this.apiBase}/app/preferences`, {
        headers: {Cookie: await this.authCookie},
      })
      .then((json) => json.data);
  }

  async setAppPreferences(preferences: Partial<QBittorrentAppPreferences>): Promise<void> {
    return axios
      .post(`${this.apiBase}/app/setPreferences`, `json=${JSON.stringify(preferences)}`, {
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async getTorrentInfos(): Promise<QBittorrentTorrentInfos> {
    return axios
      .get(`${this.apiBase}/torrents/info`, {
        headers: {Cookie: await this.authCookie},
      })
      .then((json) => json.data);
  }

  async getTorrentContents(hash: string): Promise<QBittorrentTorrentContents> {
    return axios
      .get(`${this.apiBase}/torrents/files`, {
        params: {
          hash,
        },
        headers: {Cookie: await this.authCookie},
      })
      .then((json) => json.data);
  }

  async getTorrentProperties(hash: string): Promise<QBittorrentTorrentProperties> {
    return axios
      .get(`${this.apiBase}/torrents/properties`, {
        params: {
          hash,
        },
        headers: {Cookie: await this.authCookie},
      })
      .then((json) => json.data);
  }

  async getTorrentTrackers(hash: string): Promise<QBittorrentTorrentTrackers> {
    return axios
      .get(`${this.apiBase}/torrents/trackers`, {
        params: {
          hash,
        },
        headers: {Cookie: await this.authCookie},
      })
      .then((json) => json.data);
  }

  async getTransferInfo(): Promise<QBittorrentTransferInfo> {
    return axios
      .get(`${this.apiBase}/transfer/info`, {
        headers: {Cookie: await this.authCookie},
      })
      .then((json) => json.data);
  }

  async syncTorrentPeers(hash: string): Promise<QBittorrentTorrentPeers> {
    const Cookie = await this.authCookie;

    this.syncRids.torrentPeers[hash] = (this.syncRids.torrentPeers[hash] ?? Promise.resolve(0)).then((rid) =>
      axios
        .get<QBittorrentSyncTorrentPeers>(`${this.apiBase}/sync/torrentPeers`, {
          params: {
            hash,
            rid,
          },
          headers: {Cookie},
        })
        .then(({data}) => {
          const {peers = {}, peers_removed = [], rid: newRid = 0} = data;

          if (this.syncStates.torrentPeers[hash] == null) {
            this.syncStates.torrentPeers[hash] = {};
          }

          Object.keys(peers).forEach((ip_and_port) => {
            this.syncStates.torrentPeers[hash][ip_and_port] = {
              ...this.syncStates.torrentPeers[hash][ip_and_port],
              ...peers[ip_and_port],
            };
          });

          peers_removed.forEach((ip_and_port) => {
            delete this.syncStates.torrentPeers[hash][ip_and_port];
          });

          return newRid;
        }),
    );

    try {
      await this.syncRids.torrentPeers[hash];
    } catch (e) {
      delete this.syncRids.torrentPeers[hash];
      delete this.syncStates.torrentPeers[hash];
      throw e;
    }

    return this.syncStates.torrentPeers[hash];
  }

  async torrentsPause(hashes: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/pause`, {
        params: {
          hashes: hashes.join('|'),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsResume(hashes: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/resume`, {
        params: {
          hashes: hashes.join('|'),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsDelete(hashes: Array<string>, deleteFiles: boolean): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/delete`, {
        params: {
          hashes: hashes.join('|'),
          deleteFiles: deleteFiles ? 'true' : 'false',
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsRecheck(hashes: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/recheck`, {
        params: {
          hashes: hashes.join('|'),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsSetLocation(hashes: Array<string>, location: string): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/setLocation`, {
        params: {
          hashes: hashes.join('|'),
          location,
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsSetTopPrio(hashes: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/topPrio`, {
        params: {
          hashes: hashes.join('|'),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsSetBottomPrio(hashes: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/bottomPrio`, {
        params: {
          hashes: hashes.join('|'),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsAddFiles(files: Array<Buffer>, options: QBittorrentTorrentsAddOptions): Promise<void> {
    const form = new FormData();

    files.forEach((file, index) => {
      form.append('torrents', file, {
        filename: `${index}.torrent`,
        contentType: 'application/x-bittorrent',
      });
    });

    Object.keys(options).forEach((key) => {
      const property = key as keyof typeof options;
      form.append(property, `${options[property]}`);
    });

    const headers = form.getHeaders({
      Cookie: await this.authCookie,
      'Content-Length': form.getLengthSync(),
    });

    return axios
      .post(`${this.apiBase}/torrents/add`, form, {
        headers,
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsAddURLs(urls: Array<string>, options: QBittorrentTorrentsAddOptions): Promise<void> {
    const form = new FormData();

    form.append('urls', urls.join('\n'));

    Object.keys(options).forEach((key) => {
      const property = key as keyof typeof options;
      form.append(property, `${options[property]}`);
    });

    const headers = form.getHeaders({
      Cookie: await this.authCookie,
      'Content-Length': form.getLengthSync(),
    });

    return axios
      .post(`${this.apiBase}/torrents/add`, form, {
        headers,
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsAddTags(hashes: Array<string>, tags: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/addTags`, {
        params: {
          hashes: hashes.join('|'),
          tags: tags.join(','),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsRemoveTags(hashes: Array<string>, tags?: Array<string>): Promise<void> {
    return axios
      .get(`${this.apiBase}/torrents/removeTags`, {
        params: {
          hashes: hashes.join('|'),
          tags: tags?.join(','),
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  async torrentsAddTrackers(hash: string, urls: Array<string>): Promise<void> {
    if (urls.length > 0) {
      return axios
        .get(`${this.apiBase}/torrents/addTrackers`, {
          params: {
            hash,
            urls: urls.join('\n'),
          },
          headers: {Cookie: await this.authCookie},
        })
        .then(() => {
          // returns nothing
        });
    }
  }

  async torrentsReannounce(hashes: Array<string>): Promise<void> {
    if (hashes.length > 0) {
      return axios
        .get(`${this.apiBase}/torrents/reannounce`, {
          params: {
            hashes: hashes.join('|'),
          },
          headers: {Cookie: await this.authCookie},
        })
        .then(() => {
          // returns nothing
        });
    }
  }

  async torrentsRemoveTrackers(hash: string, urls: Array<string>): Promise<void> {
    if (urls.length > 0) {
      return axios
        .get(`${this.apiBase}/torrents/removeTrackers`, {
          params: {
            hash,
            urls: urls.join('|'),
          },
          headers: {Cookie: await this.authCookie},
        })
        .then(() => {
          // returns nothing
        });
    }
  }

  async torrentsSetSuperSeeding(hashes: Array<string>, value: boolean): Promise<void> {
    if (hashes.length > 0) {
      return axios
        .get(`${this.apiBase}/torrents/setSuperSeeding`, {
          params: {
            hashes: hashes.join('|'),
            value: value ? 'true' : 'false',
          },
          headers: {Cookie: await this.authCookie},
        })
        .then(() => {
          // returns nothing
        });
    }
  }

  async torrentsToggleSequentialDownload(hashes: Array<string>): Promise<void> {
    if (hashes.length > 0) {
      return axios
        .get(`${this.apiBase}/torrents/toggleSequentialDownload`, {
          params: {
            hashes: hashes.join('|'),
          },
          headers: {Cookie: await this.authCookie},
        })
        .then(() => {
          // returns nothing
        });
    }
  }

  async torrentsFilePrio(hash: string, ids: Array<number>, priority: QBittorrentTorrentContentPriority) {
    return axios
      .get(`${this.apiBase}/torrents/filePrio`, {
        params: {
          hash,
          id: ids.join('|'),
          priority,
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(() => {
        // returns nothing
      });
  }

  constructor(connectionSettings: QBittorrentConnectionSettings) {
    this.connectionSettings = connectionSettings;
    this.apiBase = `${connectionSettings.url}/api/v2`;
    this.updateAuthCookie().catch(() => undefined);
  }
}

export default ClientRequestManager;
