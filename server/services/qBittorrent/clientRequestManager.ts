import axios from 'axios';
import FormData from 'form-data';

import type {QBittorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import type {QBittorrentAppPreferences} from './types/QBittorrentAppMethods';
import type {
  QBittorrentMainData,
  QBittorrentSyncMainData,
  QBittorrentSyncTorrentPeers,
  QBittorrentTorrentPeers,
} from './types/QBittorrentSyncMethods';
import type {QBittorrentTransferInfo} from './types/QBittorrentTransferMethods';
import type {
  QBittorrentTorrentContentPriority,
  QBittorrentTorrentContents,
  QBittorrentTorrentInfos,
  QBittorrentTorrentProperties,
  QBittorrentTorrentsAddOptions,
  QBittorrentTorrentTrackers,
} from './types/QBittorrentTorrentsMethods';

const EMPTY_SERVER_STATE = {
  dl_info_speed: 0,
  dl_info_data: 0,
  up_info_speed: 0,
  up_info_data: 0,
  dl_rate_limit: 0,
  up_rate_limit: 0,
  dht_nodes: 0,
  connection_status: 'disconnected',
} as const;

class ClientRequestManager {
  private connectionSettings: QBittorrentConnectionSettings;
  private apiBase: string;
  private authCookie?: Promise<string | undefined>;
  private isMainDataPending = false;

  private syncRids: {
    mainData: Promise<number>;
  } = {
    mainData: Promise.resolve(0),
  };

  private syncStates: {
    mainData: QBittorrentMainData;
  } = {
    mainData: {
      categories: {},
      server_state: EMPTY_SERVER_STATE,
      tags: [],
      torrents: {},
      trackers: {},
    },
  };

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

  async syncMainData(): Promise<QBittorrentMainData> {
    const Cookie = await this.authCookie;

    if (this.isMainDataPending == false) {
      this.isMainDataPending = true;
      this.syncRids.mainData = this.syncRids.mainData.then((rid) =>
        axios
          .get<QBittorrentSyncMainData>(`${this.apiBase}/sync/maindata`, {
            params: {
              rid,
            },
            headers: {Cookie},
          })
          .then(({data}) => {
            const {
              rid: newRid = 0,
              full_update = false,
              categories = {},
              categories_removed = [],
              server_state = EMPTY_SERVER_STATE,
              tags = [],
              tags_removed = [],
              torrents = {},
              torrents_removed = [],
              trackers = {},
              trackers_removed = [],
            } = data;

            if (full_update) {
              this.syncStates.mainData = {
                categories,
                server_state,
                tags,
                torrents,
                trackers,
              };
            } else {
              // categories
              Object.keys(categories).forEach((category) => {
                this.syncStates.mainData.categories[category] = {
                  ...this.syncStates.mainData.categories[category],
                  ...categories[category],
                };
              });

              categories_removed.forEach((category) => {
                delete this.syncStates.mainData.categories[category];
              });

              // tags
              this.syncStates.mainData.tags.push(...tags);
              this.syncStates.mainData.tags = this.syncStates.mainData.tags.filter(
                (tag) => !tags_removed.includes(tag),
              );

              // torrents
              Object.keys(torrents).forEach((torrent) => {
                this.syncStates.mainData.torrents[torrent] = {
                  ...this.syncStates.mainData.torrents[torrent],
                  ...torrents[torrent],
                };
              });

              torrents_removed.forEach((torrent) => {
                delete this.syncStates.mainData.torrents[torrent];
              });

              // trackers
              Object.keys(trackers).forEach((tracker) => {
                this.syncStates.mainData.trackers[tracker] = {
                  ...this.syncStates.mainData.trackers[tracker],
                  ...trackers[tracker],
                };
              });

              trackers_removed.forEach((tracker) => {
                delete this.syncStates.mainData.trackers[tracker];
              });
            }

            return newRid;
          })
          .finally(() => {
            this.isMainDataPending = false;
          }),
      );
    }

    try {
      await this.syncRids.mainData;
    } catch (e) {
      this.syncRids.mainData = Promise.resolve(0);
      throw e;
    }

    return this.syncStates.mainData;
  }

  async syncTorrentPeers(hash: string): Promise<QBittorrentTorrentPeers> {
    return axios
      .get<QBittorrentSyncTorrentPeers>(`${this.apiBase}/sync/torrentPeers`, {
        params: {
          hash,
          rid: 0,
        },
        headers: {Cookie: await this.authCookie},
      })
      .then(({data}) => data.peers as QBittorrentTorrentPeers);
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
