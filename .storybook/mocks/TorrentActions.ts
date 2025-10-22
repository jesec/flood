/**
 * Mock TorrentActions for Storybook
 * All state is managed through the centralized MockStateStore
 */

import type {AddTorrentByFileOptions, AddTorrentByURLOptions} from '@shared/schema/api/torrents';
import type {TorrentProperties} from '@shared/types/Torrent';
import {TorrentPriority} from '@shared/types/Torrent';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';

import AlertStore from '../../client/src/javascript/stores/AlertStore';
import TorrentStore from '../../client/src/javascript/stores/TorrentStore';
import UIStore from '../../client/src/javascript/stores/UIStore';
import {
  createNewTorrentTemplate,
  MOCK_MEDIAINFO_OUTPUT,
  MOCK_TORRENT_CONTENTS,
  MOCK_TORRENT_PEERS,
  MOCK_TORRENT_SPEEDS,
  MOCK_TORRENT_TRACKER_LIST,
} from './_fixtures';
import mockStateStore from './MockStateStore';

/**
 * Helper to determine proper status array based on torrent state
 */
function getProperStatus(torrent: TorrentProperties, action: 'start' | 'stop' | 'check'): TorrentProperties['status'] {
  const isComplete = torrent.percentComplete === 100;

  switch (action) {
    case 'start':
      if (isComplete) {
        return ['seeding', 'complete', 'active'];
      } else {
        return ['downloading', 'active'];
      }

    case 'stop':
      if (isComplete) {
        return ['stopped', 'complete', 'inactive'];
      } else {
        return ['stopped', 'inactive'];
      }

    case 'check':
      return ['checking', 'active'];

    default:
      return torrent.status;
  }
}

const TorrentActions = {
  startTorrents: async ({hashes}: {hashes: string[]}) => {
    console.log('[MockTorrentActions] Starting torrents:', hashes);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent && torrent.status.includes('stopped')) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          status: getProperStatus(torrent, 'start'),
          downRate: torrent.percentComplete < 100 ? MOCK_TORRENT_SPEEDS.DOWNLOADING : 0,
          upRate: torrent.percentComplete > 0 ? MOCK_TORRENT_SPEEDS.UPLOADING : 0,
          dateActive: -1,
          eta:
            torrent.percentComplete < 100
              ? Math.floor((torrent.sizeBytes - torrent.bytesDone) / MOCK_TORRENT_SPEEDS.DOWNLOADING)
              : -1,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }

    return Promise.resolve();
  },

  stopTorrents: async ({hashes}: {hashes: string[]}) => {
    console.log('[MockTorrentActions] Stopping torrents:', hashes);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent && !torrent.status.includes('stopped')) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          status: getProperStatus(torrent, 'stop'),
          downRate: 0,
          upRate: 0,
          dateActive: Date.now(),
          eta: -1,
          peersConnected: 0,
          seedsConnected: 0,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }

    return Promise.resolve();
  },

  checkHash: ({hashes}: {hashes: string[]}) => {
    console.log('[MockTorrentActions] Checking hash for torrents:', hashes);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          status: getProperStatus(torrent, 'check'),
          downRate: 0,
          upRate: 0,
          dateActive: -1,
          eta: Math.floor(torrent.sizeBytes / MOCK_TORRENT_SPEEDS.CHECKING), // Checking speed
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);

      // Store the checking hashes to handle properly after delay
      const checkingHashes = new Set(hashes);

      // Simulate checking completion after 2 seconds
      setTimeout(() => {
        const currentState = mockStateStore.getState();
        const currentTorrents = {...currentState.torrents};
        let needsUpdate = false;

        // Only update torrents that are still in checking state
        checkingHashes.forEach((hash) => {
          const torrent = currentTorrents[hash];
          // Only update if still checking (not changed by other actions)
          if (torrent && torrent.status.includes('checking')) {
            needsUpdate = true;
            currentTorrents[hash] = {
              ...torrent,
              status: getProperStatus(torrent, 'stop'), // Return to stopped after check
              eta: -1,
            };
          }
        });

        // Only update if we found torrents still checking
        if (needsUpdate) {
          mockStateStore.setState({torrents: currentTorrents});
          TorrentStore.handleTorrentListFullUpdate(currentTorrents);
        }
      }, 2000);
    }

    return Promise.resolve();
  },

  reannounce: ({hashes}: {hashes: string[]}) => {
    console.log('[MockTorrentActions] Reannouncing torrents:', hashes);

    // Simulate tracker update
    setTimeout(() => {
      const state = mockStateStore.getState();
      const updatedTorrents = {...state.torrents};

      hashes.forEach((hash) => {
        const torrent = updatedTorrents[hash];
        if (torrent) {
          // Update peer/seed counts to simulate reannounce effect
          // Use deterministic values based on hash for consistent testing
          updatedTorrents[hash] = {
            ...torrent,
            peersTotal: 30 + (hash.charCodeAt(0) % 50),
            seedsTotal: 10 + (hash.charCodeAt(1) % 20),
          };
        }
      });

      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }, 500);

    return Promise.resolve();
  },

  setInitialSeeding: ({hashes, isInitialSeeding}: {hashes: string[]; isInitialSeeding: boolean}) => {
    console.log('[MockTorrentActions] Setting initial seeding:', hashes, isInitialSeeding);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent && torrent.percentComplete === 100) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          isInitialSeeding,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }

    return Promise.resolve();
  },

  setSequential: ({hashes, isSequential}: {hashes: string[]; isSequential: boolean}) => {
    console.log('[MockTorrentActions] Setting sequential:', hashes, isSequential);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          isSequential,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }

    return Promise.resolve();
  },

  setPriority: ({hashes, priority}: {hashes: string[]; priority: TorrentPriority}) => {
    console.log('[MockTorrentActions] Setting priority:', hashes, priority);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          priority,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }

    return Promise.resolve();
  },

  deleteTorrents: ({hashes, deleteData}: {hashes: string[]; deleteData: boolean}) => {
    console.log('[MockTorrentActions] Deleting torrents:', hashes, 'deleteData:', deleteData);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};

    hashes.forEach((hash) => {
      delete updatedTorrents[hash];
    });

    mockStateStore.setState({torrents: updatedTorrents});
    TorrentStore.handleTorrentListFullUpdate(updatedTorrents);

    AlertStore.add({
      id: 'alert.torrent.remove',
      type: 'success',
      count: hashes.length,
    });

    return Promise.resolve();
  },

  moveTorrents: ({hashes, destination, moveFiles}: {hashes: string[]; destination: string; moveFiles: boolean}) => {
    console.log('[MockTorrentActions] Moving torrents:', hashes, 'to:', destination, 'moveFiles:', moveFiles);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          directory: destination,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);

      AlertStore.add({
        id: 'alert.torrent.move',
        type: 'success',
        count: hashes.length,
      });
    }

    return Promise.resolve();
  },

  setTags: ({hashes, tags}: {hashes: string[]; tags: string[]}) => {
    console.log('[MockTorrentActions] Setting tags:', hashes, tags);

    // Validate tags don't contain commas (as per API requirement)
    const invalidTags = tags.filter((tag) => tag.includes(','));
    if (invalidTags.length > 0) {
      console.error('[MockTorrentActions] Invalid tags containing commas:', invalidTags);
      return Promise.reject(new Error('Tags cannot contain commas'));
    }

    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          tags,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
      UIStore.handleSetTaxonomySuccess();
    }

    return Promise.resolve();
  },

  setTrackers: ({hashes, trackers}: {hashes: string[]; trackers: string[]}) => {
    console.log('[MockTorrentActions] Setting trackers:', hashes, trackers);
    const state = mockStateStore.getState();
    const updatedTorrents = {...state.torrents};
    let changed = false;

    hashes.forEach((hash) => {
      const torrent = updatedTorrents[hash];
      if (torrent) {
        changed = true;
        updatedTorrents[hash] = {
          ...torrent,
          trackerURIs: trackers,
        };
      }
    });

    if (changed) {
      mockStateStore.setState({torrents: updatedTorrents});
      TorrentStore.handleTorrentListFullUpdate(updatedTorrents);
    }

    return Promise.resolve();
  },

  // Add torrent methods
  addTorrentsByUrls: ({urls, destination, tags, isBasePath: _isBasePath, start}: AddTorrentByURLOptions) => {
    console.log('[MockTorrentActions] Adding torrents by URLs:', urls);

    const newHash = 'NEW' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const newTorrent = createNewTorrentTemplate(newHash, {
      name: `New Torrent ${new Date().toLocaleTimeString()}`,
      destination: destination || '/downloads',
      tags: tags || [],
      start,
      comment: `Added from URL: ${urls[0]}`,
    });

    const state = mockStateStore.getState();
    mockStateStore.setState({
      torrents: {...state.torrents, [newHash]: newTorrent},
    });

    TorrentStore.handleTorrentListFullUpdate(mockStateStore.getState().torrents);

    AlertStore.add({
      id: 'alert.torrent.add',
      type: 'success',
      count: urls.length,
    });

    return Promise.resolve();
  },

  addTorrentsByFiles: ({files, destination, tags, isBasePath, start}: AddTorrentByFileOptions) => {
    console.log('[MockTorrentActions] Adding torrents by files:', files.length, 'files');
    // Map files to URLs, ensuring we have at least one
    const fileUrls =
      files.length > 0
        ? files.map((f: string, idx: number) => `file://torrent${idx}.torrent`)
        : ['file://default.torrent'];

    return TorrentActions.addTorrentsByUrls({
      urls: fileUrls as [string, ...string[]],
      destination,
      tags,
      isBasePath,
      start,
    });
  },

  createTorrent: (options: {
    name: string;
    sourcePath: string;
    trackers?: string[];
    comment?: string;
    infoSource?: string;
    isPrivate?: boolean;
    start?: boolean;
  }) => {
    console.log('[MockTorrentActions] Creating torrent:', options.name);

    AlertStore.add({
      id: 'alert.torrent.add',
      type: 'success',
      count: 1,
    });

    return Promise.resolve();
  },

  // Fetch torrent details
  fetchTorrentContents: (hash: string): Promise<Array<TorrentContent> | null> => {
    console.log('[MockTorrentActions] Fetching contents for torrent:', hash);
    return Promise.resolve(MOCK_TORRENT_CONTENTS);
  },

  fetchTorrentPeers: (hash: string): Promise<Array<TorrentPeer> | null> => {
    console.log('[MockTorrentActions] Fetching peers for torrent:', hash);
    return Promise.resolve(MOCK_TORRENT_PEERS);
  },

  fetchTorrentTrackers: (hash: string): Promise<Array<TorrentTracker> | null> => {
    console.log('[MockTorrentActions] Fetching trackers for torrent:', hash);
    return Promise.resolve(MOCK_TORRENT_TRACKER_LIST);
  },

  fetchMediainfo: (hash: string): Promise<{output: string}> => {
    console.log('[MockTorrentActions] Fetching mediainfo for torrent:', hash);
    return Promise.resolve({output: MOCK_MEDIAINFO_OUTPUT});
  },

  getTorrentContentsDataPermalink: (hash: string, indices: number[]): Promise<string> => {
    console.log('[MockTorrentActions] Getting permalink for torrent:', hash, 'indices:', indices);
    return Promise.resolve(
      `http://localhost:3000/api/torrents/${hash}/contents/${indices.join(',')}/data?token=mock-token-${Date.now()}`,
    );
  },

  setFilePriority: (hash: string, {indices, priority}: {indices: number[]; priority: number}): Promise<void> => {
    console.log(
      '[MockTorrentActions] Setting file priority for torrent:',
      hash,
      'indices:',
      indices,
      'priority:',
      priority,
    );
    return Promise.resolve();
  },
};

export default TorrentActions;
