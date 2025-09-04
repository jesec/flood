/**
 * Centralized mock state store for all Storybook stories
 * This provides a single source of truth for all mock data
 */

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {Feed, Item, Rule} from '@shared/types/Feed';
import type {FloodSettings} from '@shared/types/FloodSettings';
import type {Notification} from '@shared/types/Notification';
import type {LocationTreeNode, Taxonomy} from '@shared/types/Taxonomy';
import type {TorrentProperties} from '@shared/types/Torrent';
import type {TransferHistory, TransferSummary} from '@shared/types/TransferData';

import {
  MOCK_CLIENT_SETTINGS,
  MOCK_FEED_ITEMS,
  MOCK_FEED_RULES,
  MOCK_FEEDS,
  MOCK_FLOOD_SETTINGS,
  MOCK_NOTIFICATIONS,
  MOCK_SPEED_LIMITS,
  MOCK_TORRENT_STATES,
  MOCK_USERS,
} from './_fixtures';

interface MockState {
  torrents: Record<string, TorrentProperties>;
  settings: FloodSettings;
  clientSettings: ClientSettings;
  speedLimits: {download: number; upload: number};
  notifications: Notification[];
  transferHistory: TransferHistory;
  transferSummary: TransferSummary;
  taxonomy: Taxonomy;
  feeds: Feed[];
  feedRules: Rule[];
  feedItems: Item[];
  users: Array<{username: string; level: number}>;
  currentUser: {username: string; level: number};
}

interface DirectoryStats {
  count: number;
  size: number;
  torrents: Set<string>; // Track unique torrents to avoid double counting
}

class MockStateStore {
  private state: MockState;
  private taxonomyCache: Taxonomy | null = null;
  private lastTorrentHash: string | null = null;

  constructor() {
    // Initialize with default state
    this.state = {
      torrents: {...MOCK_TORRENT_STATES},
      settings: {...MOCK_FLOOD_SETTINGS},
      clientSettings: {...MOCK_CLIENT_SETTINGS},
      speedLimits: {...MOCK_SPEED_LIMITS},
      notifications: [...MOCK_NOTIFICATIONS],
      transferHistory: {
        timestamps: Array.from({length: 30}, (_, i) => Date.now() - i * 60000),
        // Deterministic transfer data with realistic variations
        download: Array.from({length: 30}, (_, i) => {
          // Base: 5MB/s with sine wave variation
          const base = 5 * 1024 * 1024;
          const variation = Math.sin(i * 0.5) * 2 * 1024 * 1024;
          return Math.max(0, base + variation);
        }),
        upload: Array.from({length: 30}, (_, i) => {
          // Base: 2MB/s with cosine wave variation
          const base = 2 * 1024 * 1024;
          const variation = Math.cos(i * 0.3) * 1024 * 1024;
          return Math.max(0, base + variation);
        }),
      },
      transferSummary: {
        downRate: 5242880, // 5 MB/s
        downTotal: 104857600, // 100 MB
        upRate: 2621440, // 2.5 MB/s
        upTotal: 52428800, // 50 MB
      },
      // Taxonomy is computed dynamically
      taxonomy: this.computeTaxonomy({...MOCK_TORRENT_STATES}),
      feeds: [...MOCK_FEEDS],
      feedRules: [...MOCK_FEED_RULES],
      feedItems: [...MOCK_FEED_ITEMS],
      users: [...MOCK_USERS],
      currentUser: {username: 'storybook-user', level: 10},
    };
  }

  /**
   * Compute taxonomy from torrents with proper parent directory handling
   */
  private computeTaxonomy(torrents: Record<string, TorrentProperties>): Taxonomy {
    // Return cached value if available
    if (this.taxonomyCache) {
      return this.taxonomyCache;
    }
    const taxonomy: Taxonomy = {
      locationTree: {
        directoryName: '/',
        fullPath: '/',
        children: [],
        containedCount: 0,
        containedSize: 0,
      },
      statusCounts: {},
      statusSizes: {},
      tagCounts: {},
      tagSizes: {},
      trackerCounts: {},
      trackerSizes: {},
    };

    // Build location tree with proper parent counting
    const locationMap = new Map<string, DirectoryStats>();

    // First pass: Add direct torrent locations
    Object.entries(torrents).forEach(([hash, torrent]) => {
      const dir = torrent.directory;
      if (dir) {
        // Add to direct directory
        if (!locationMap.has(dir)) {
          locationMap.set(dir, {count: 0, size: 0, torrents: new Set()});
        }
        const dirStats = locationMap.get(dir)!;
        dirStats.count++;
        dirStats.size += torrent.sizeBytes;
        dirStats.torrents.add(hash);

        // Add to all parent directories
        const parts = dir.split('/').filter(Boolean);
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : `/${parts[i]}`;
          if (!locationMap.has(currentPath)) {
            locationMap.set(currentPath, {count: 0, size: 0, torrents: new Set()});
          }
          const parentStats = locationMap.get(currentPath)!;
          // Use Set to ensure we don't count the same torrent multiple times
          if (!parentStats.torrents.has(hash)) {
            parentStats.count++;
            parentStats.size += torrent.sizeBytes;
            parentStats.torrents.add(hash);
          }
        }
      }
    });

    // Build tree structure recursively
    const buildTree = (path: string): LocationTreeNode => {
      const stats = locationMap.get(path) || {count: 0, size: 0, torrents: new Set()};
      const children: LocationTreeNode[] = [];

      // Find direct children of this path
      // const pathDepth = path === '/' ? 0 : path.split('/').filter(Boolean).length;

      locationMap.forEach((_, childPath) => {
        if (childPath === path) return;

        // Check if this is a direct child
        if (childPath.startsWith(path)) {
          const relativePath = path === '/' ? childPath : childPath.substring(path.length);

          const relativeDepth = relativePath.split('/').filter(Boolean).length;
          if (relativeDepth === 1) {
            children.push(buildTree(childPath));
          }
        }
      });

      // Sort children by name
      children.sort((a, b) => a.directoryName.localeCompare(b.directoryName));

      const dirName = path === '/' ? '/' : path.split('/').pop() || path;
      return {
        directoryName: dirName,
        fullPath: path,
        children,
        containedCount: stats.count,
        containedSize: stats.size,
      };
    };

    // Build root tree
    const rootStats = {
      count: Object.keys(torrents).length,
      size: Object.values(torrents).reduce((sum, t) => sum + t.sizeBytes, 0),
      torrents: new Set(Object.keys(torrents)),
    };

    // Find top-level directories
    const topLevelDirs = new Set<string>();
    locationMap.forEach((_, path) => {
      const depth = path.split('/').filter(Boolean).length;
      if (depth === 1) {
        topLevelDirs.add(path);
      }
    });

    const rootChildren: LocationTreeNode[] = [];
    topLevelDirs.forEach((dir) => {
      rootChildren.push(buildTree(dir));
    });

    // Sort root children
    rootChildren.sort((a, b) => a.directoryName.localeCompare(b.directoryName));

    taxonomy.locationTree = {
      directoryName: '/',
      fullPath: '/',
      children: rootChildren,
      containedCount: rootStats.count,
      containedSize: rootStats.size,
    };

    // Initialize "All" counts for all filter types (empty string represents "All")
    const allTorrents = Object.values(torrents);
    const totalCount = allTorrents.length;
    const totalSize = allTorrents.reduce((sum, t) => sum + t.sizeBytes, 0);

    // Set "All" counts for each filter type
    taxonomy.statusCounts[''] = totalCount;
    taxonomy.statusSizes[''] = totalSize;
    taxonomy.tagCounts[''] = totalCount;
    // NOTE: "All" tag filter should NOT have size (per real app behavior)
    // taxonomy.tagSizes[''] is intentionally not set
    taxonomy.trackerCounts[''] = totalCount;
    // NOTE: "All" tracker filter should NOT have size (for consistency with tags)
    // taxonomy.trackerSizes[''] is intentionally not set

    // Initialize untagged count if it doesn't exist (should always appear in UI)
    if (!Object.prototype.hasOwnProperty.call(taxonomy.tagCounts, 'untagged')) {
      taxonomy.tagCounts['untagged'] = 0;
      // NOTE: "untagged" filter should NOT have size (per real app behavior)
    }

    // Compute tag counts and sizes
    Object.values(torrents).forEach((torrent) => {
      // Tags
      if (torrent.tags && torrent.tags.length > 0) {
        torrent.tags.forEach((tag) => {
          taxonomy.tagCounts[tag] = (taxonomy.tagCounts[tag] || 0) + 1;
          taxonomy.tagSizes[tag] = (taxonomy.tagSizes[tag] || 0) + torrent.sizeBytes;
        });
      } else {
        // Add untagged
        taxonomy.tagCounts['untagged'] = (taxonomy.tagCounts['untagged'] || 0) + 1;
        // NOTE: "untagged" filter should NOT have size (per real app behavior)
        // taxonomy.tagSizes['untagged'] is intentionally not set
      }

      // Status counts and sizes - count each status separately
      torrent.status.forEach((status) => {
        taxonomy.statusCounts[status] = (taxonomy.statusCounts[status] || 0) + 1;
        taxonomy.statusSizes[status] = (taxonomy.statusSizes[status] || 0) + torrent.sizeBytes;
      });

      // Tracker counts and sizes
      if (torrent.trackerURIs && torrent.trackerURIs.length > 0) {
        torrent.trackerURIs.forEach((uri) => {
          // Extract domain from tracker URI
          let domain = uri;
          try {
            if (uri.includes('://')) {
              const url = new URL(uri);
              domain = url.hostname;
            } else {
              domain = uri.split('/')[0].split(':')[0];
            }
          } catch {
            // Use as-is if parsing fails
          }
          taxonomy.trackerCounts[domain] = (taxonomy.trackerCounts[domain] || 0) + 1;
          taxonomy.trackerSizes[domain] = (taxonomy.trackerSizes[domain] || 0) + torrent.sizeBytes;
        });
      }
    });

    // Cache the computed taxonomy
    this.taxonomyCache = taxonomy;
    return this.taxonomyCache;
  }

  /**
   * Get current state
   */
  getState(): MockState {
    // Return cached state (taxonomy is already computed when torrents change)
    return this.state;
  }

  /**
   * Update state with partial updates
   * Note: Taxonomy is always computed, so any taxonomy in updates is ignored
   */
  setState(updates: Partial<MockState>): void {
    // Extract taxonomy to ignore it (it's computed)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {taxonomy: _taxonomy, ...actualUpdates} = updates;

    // Apply all updates except taxonomy
    Object.assign(this.state, actualUpdates);

    // Recompute taxonomy only if torrents actually changed
    if (updates.torrents) {
      const currentHash = JSON.stringify(Object.keys(updates.torrents).sort());
      if (currentHash !== this.lastTorrentHash) {
        this.lastTorrentHash = currentHash;
        this.taxonomyCache = null; // Invalidate cache
        this.state.taxonomy = this.computeTaxonomy(this.state.torrents);
      }
    }

    console.log('[MockStateStore] State updated:', Object.keys(updates));
  }

  /**
   * Reset state to defaults
   */
  reset(): void {
    // Clear caches
    this.taxonomyCache = null;
    this.lastTorrentHash = null;

    const defaultTorrents = {...MOCK_TORRENT_STATES};
    this.state = {
      torrents: defaultTorrents,
      settings: {...MOCK_FLOOD_SETTINGS},
      clientSettings: {...MOCK_CLIENT_SETTINGS},
      speedLimits: {...MOCK_SPEED_LIMITS},
      notifications: [],
      transferHistory: {
        timestamps: Array.from({length: 30}, (_, i) => Date.now() - i * 60000),
        // Deterministic transfer data with realistic variations
        download: Array.from({length: 30}, (_, i) => {
          // Base: 5MB/s with sine wave variation
          const base = 5 * 1024 * 1024;
          const variation = Math.sin(i * 0.5) * 2 * 1024 * 1024;
          return Math.max(0, base + variation);
        }),
        upload: Array.from({length: 30}, (_, i) => {
          // Base: 2MB/s with cosine wave variation
          const base = 2 * 1024 * 1024;
          const variation = Math.cos(i * 0.3) * 1024 * 1024;
          return Math.max(0, base + variation);
        }),
      },
      transferSummary: {
        downRate: 5242880,
        downTotal: 104857600,
        upRate: 2621440,
        upTotal: 52428800,
      },
      taxonomy: this.computeTaxonomy(defaultTorrents),
      feeds: [...MOCK_FEEDS],
      feedRules: [...MOCK_FEED_RULES],
      feedItems: [...MOCK_FEED_ITEMS],
      users: [...MOCK_USERS],
      currentUser: {username: 'storybook-user', level: 10},
    };
    console.log('[MockStateStore] State reset to defaults');
  }

  /**
   * Helper to set a single torrent
   */
  setTorrent(hash: string, torrent: TorrentProperties): void {
    const oldTorrent = this.state.torrents[hash];

    // Only update if actually changed
    if (JSON.stringify(oldTorrent) !== JSON.stringify(torrent)) {
      this.state.torrents = {
        ...this.state.torrents,
        [hash]: torrent,
      };

      // Invalidate cache and recompute
      this.taxonomyCache = null;
      this.lastTorrentHash = null;
      this.state.taxonomy = this.computeTaxonomy(this.state.torrents);
    }
  }

  /**
   * Helper to update settings
   */
  updateSettings(settings: Partial<FloodSettings>): void {
    this.state.settings = {
      ...this.state.settings,
      ...settings,
    };
  }

  /**
   * Add a notification (with bounds checking)
   */
  addNotification(notification: Notification): void {
    const MAX_NOTIFICATIONS = 100; // Prevent unbounded growth

    // Add new notification
    this.state.notifications.push(notification);

    // Remove oldest notifications if we exceed the limit
    if (this.state.notifications.length > MAX_NOTIFICATIONS) {
      this.state.notifications = this.state.notifications.slice(-MAX_NOTIFICATIONS);
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.state.notifications = [];
  }
}

// Export singleton instance
export const mockStateStore = new MockStateStore();
export default mockStateStore;
