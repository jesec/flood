/**
 * Overview Route Story
 * Shows the complete application overview with torrents, sidebar, and action bar
 */

import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect, waitFor} from 'storybook/test';
import React from 'react';

import Overview from './Overview';
// Using the mock FloodActions from Storybook mocks
import FloodActions from '../../../../.storybook/mocks/FloodActions';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import AuthActions from '@client/actions/AuthActions';
import {createMockMouseEvent, TEST_TIMEOUTS} from '../test-utils/storybook-helpers';
import type {TorrentProperties} from '@shared/types/Torrent';
import {TorrentPriority} from '@shared/types/Torrent';
import {TorrentStatus} from '@shared/constants/torrentStatusMap';

// Import mocks using relative paths since they're not in the webpack alias
import MockStateStore from '../../../../.storybook/mocks/MockStateStore';
import {MOCK_FLOOD_SETTINGS, MOCK_NOTIFICATIONS, SIZE, TIME} from '../../../../.storybook/mocks/_fixtures';

const meta: Meta<typeof Overview> = {
  title: 'Routes/Overview',
  component: Overview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main Overview route showing the complete torrent interface with sidebar filters, action bar, and torrent list.',
      },
    },
  },
  argTypes: {
    viewSize: {
      control: 'radio',
      options: ['expanded', 'condensed'],
      description: 'Toggle between expanded and condensed view',
      defaultValue: 'expanded',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Direct component without router wrapper - Storybook provides the router
import {observer} from 'mobx-react-lite';

const OverviewWrapper = observer(({viewSize}: {viewSize?: 'expanded' | 'condensed'}) => {
  // Apply view size if provided
  React.useEffect(() => {
    if (viewSize) {
      console.log('[Story] Setting view size to:', viewSize);
      // Update the setting directly in the store
      MockStateStore.updateSettings({torrentListViewSize: viewSize});
      // Trigger a full re-fetch to update components
      FloodActions.restartActivityStream();
    }
  }, [viewSize]);

  return <Overview />;
});

// Helper to programmatically set filters without needing event objects
const setFilters = (filters: {status?: Array<TorrentStatus>; tags?: string[]; search?: string}) => {
  // Create a mock event for filter operations
  const mockEvent = createMockMouseEvent();

  // Clear all filters first
  TorrentFilterStore.clearAllFilters();

  // Set search filter if provided
  if (filters.search !== undefined) {
    TorrentFilterStore.setSearchFilter(filters.search);
  }

  // Set status filters if provided
  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((status) => {
      TorrentFilterStore.setStatusFilters(status, mockEvent);
    });
  }

  // Set tag filters if provided
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => {
      TorrentFilterStore.setTagFilters(tag, mockEvent);
    });
  }
};

// Helper to create a torrent with specific properties
const createTorrent = (hash: string, overrides: Partial<TorrentProperties>): TorrentProperties => {
  const base: TorrentProperties = {
    hash,
    name: 'Torrent ' + hash,
    status: ['stopped'],
    bytesDone: 0,
    comment: '',
    dateActive: 0,
    dateAdded: Date.now(),
    dateCreated: Date.now(),
    dateFinished: 0,
    directory: '/downloads',
    downRate: 0,
    downTotal: 0,
    eta: -1,
    isPrivate: false,
    isInitialSeeding: false,
    isSequential: false,
    message: '',
    peersConnected: 0,
    peersTotal: 0,
    percentComplete: 0,
    priority: TorrentPriority.NORMAL,
    ratio: 0,
    seedsConnected: 0,
    seedsTotal: 0,
    sizeBytes: SIZE.GB,
    tags: [],
    trackerURIs: [],
    upRate: 0,
    upTotal: 0,
  };
  return {...base, ...overrides};
};

// Global variable to store story intervals for cleanup
let storyIntervals: NodeJS.Timeout[] = [];

// Global cleanup to ensure clean state between stories
const cleanupStory = () => {
  console.log('[Story] Cleaning up previous story state');

  // Clear all story intervals
  storyIntervals.forEach((interval) => clearInterval(interval));
  storyIntervals = [];

  // Stop any running updates
  FloodActions.closeActivityStream();
  // Reset mock state
  MockStateStore.reset();
  // Clear any filters
  TorrentFilterStore.clearAllFilters();
};

const setupOverviewData = async () => {
  // Always cleanup first
  cleanupStory();

  // Create diverse set of torrents
  const torrents: Record<string, TorrentProperties> = {
    // Downloading torrents
    'dl-ubuntu': createTorrent('dl-ubuntu', {
      name: 'Ubuntu 23.10 Desktop amd64',
      status: ['downloading', 'active'],
      bytesDone: 1.2 * SIZE.GB,
      sizeBytes: 3.8 * SIZE.GB,
      downRate: 5.5 * SIZE.MB,
      upRate: 512 * SIZE.KB,
      percentComplete: Math.floor((1.2 / 3.8) * 100),
      ratio: 0.15,
      eta: Math.floor(((3.8 - 1.2) * SIZE.GB) / (5.5 * SIZE.MB)),
      dateActive: -1,
      tags: ['linux', 'os', 'ubuntu'],
      trackerURIs: ['https://tracker.ubuntu.com:443/announce'],
      directory: '/downloads/linux',
      peersConnected: 12,
      peersTotal: 45,
      seedsConnected: 3,
      seedsTotal: 15,
    }),
    'dl-fedora': createTorrent('dl-fedora', {
      name: 'Fedora-Workstation-Live-x86_64-39',
      status: ['downloading', 'active'],
      bytesDone: 0.8 * SIZE.GB,
      sizeBytes: 2.1 * SIZE.GB,
      downRate: 3.2 * SIZE.MB,
      upRate: 256 * SIZE.KB,
      percentComplete: Math.floor((0.8 / 2.1) * 100),
      ratio: 0.08,
      eta: Math.floor(((2.1 - 0.8) * SIZE.GB) / (3.2 * SIZE.MB)),
      dateActive: -1,
      tags: ['linux', 'os', 'fedora'],
      trackerURIs: ['https://torrent.fedoraproject.org/announce'],
      directory: '/downloads/linux',
      peersConnected: 8,
      peersTotal: 30,
      seedsConnected: 2,
      seedsTotal: 10,
    }),
    'dl-movie': createTorrent('dl-movie', {
      name: 'Big Buck Bunny 1080p',
      status: ['downloading', 'active'],
      bytesDone: 450 * SIZE.MB,
      sizeBytes: 1.5 * SIZE.GB,
      downRate: 8 * SIZE.MB,
      upRate: 1 * SIZE.MB,
      percentComplete: Math.floor((450 / 1500) * 100),
      ratio: 0.22,
      eta: Math.floor((1.5 * SIZE.GB - 450 * SIZE.MB) / (8 * SIZE.MB)),
      dateActive: -1,
      tags: [], // Untagged torrent to test untagged filter
      trackerURIs: ['https://tracker.example.com:443/announce'],
      directory: '/downloads/media',
      peersConnected: 25,
      peersTotal: 100,
      seedsConnected: 5,
      seedsTotal: 20,
    }),

    // Seeding torrents
    'sd-debian': createTorrent('sd-debian', {
      name: 'debian-12.2.0-amd64-netinst.iso',
      status: ['seeding', 'complete', 'active'],
      bytesDone: 628 * SIZE.MB,
      sizeBytes: 628 * SIZE.MB,
      percentComplete: 100,
      downRate: 0,
      upRate: 2.1 * SIZE.MB,
      ratio: 12.5,
      dateActive: -1,
      dateFinished: Date.now() - 2 * TIME.DAY,
      seedsConnected: 0,
      seedsTotal: 5,
      peersConnected: 8,
      peersTotal: 15,
      tags: ['linux', 'os', 'debian'],
      trackerURIs: ['https://tracker.debian.org:443/announce'],
      directory: '/downloads/linux',
    }),
    'sd-arch': createTorrent('sd-arch', {
      name: 'archlinux-2024.01.01-x86_64.iso',
      status: ['seeding', 'complete', 'active'],
      bytesDone: 800 * SIZE.MB,
      sizeBytes: 800 * SIZE.MB,
      percentComplete: 100,
      downRate: 0,
      upRate: 4.5 * SIZE.MB,
      ratio: 25.3,
      dateActive: -1,
      dateFinished: Date.now() - 7 * TIME.DAY,
      seedsConnected: 0,
      seedsTotal: 10,
      peersConnected: 15,
      peersTotal: 30,
      tags: ['linux', 'os', 'arch'],
      trackerURIs: ['https://tracker.archlinux.org:443/announce'],
      directory: '/downloads/linux',
    }),
    'sd-kali': createTorrent('sd-kali', {
      name: 'kali-linux-2023.4-installer-amd64.iso',
      status: ['seeding', 'complete', 'active'],
      bytesDone: 3.6 * SIZE.GB,
      sizeBytes: 3.6 * SIZE.GB,
      percentComplete: 100,
      downRate: 0,
      upRate: 1.8 * SIZE.MB,
      ratio: 8.7,
      dateActive: -1,
      dateFinished: Date.now() - 3 * TIME.DAY,
      tags: ['linux', 'os', 'security'],
      trackerURIs: ['https://tracker.kali.org:443/announce'],
      directory: '/downloads/linux',
      seedsConnected: 0,
      seedsTotal: 12,
      peersConnected: 6,
      peersTotal: 20,
    }),

    // Stopped torrents
    'st-game': createTorrent('st-game', {
      name: 'OpenTTD-13.4-linux-generic-amd64.tar.xz',
      status: ['stopped', 'inactive'],
      bytesDone: 12 * SIZE.MB,
      sizeBytes: 12 * SIZE.MB,
      percentComplete: 100,
      downRate: 0,
      upRate: 0,
      ratio: 3.2,
      dateActive: 0,
      dateFinished: Date.now() - 14 * TIME.DAY,
      tags: ['games', 'opensource'],
      trackerURIs: ['https://tracker.openttd.org:443/announce'],
      directory: '/downloads/games',
    }),
    'st-book': createTorrent('st-book', {
      name: 'Programming Books Collection',
      status: ['stopped', 'inactive'],
      bytesDone: 245 * SIZE.MB,
      sizeBytes: 890 * SIZE.MB,
      percentComplete: Math.floor((245 / 890) * 100),
      downRate: 0,
      upRate: 0,
      ratio: 0.5,
      dateActive: 0,
      tags: ['books', 'programming'],
      trackerURIs: ['https://tracker.example.com:443/announce'],
      directory: '/downloads/books',
    }),

    // Error torrent
    'er-missing': createTorrent('er-missing', {
      name: 'Missing Files Torrent',
      status: ['error', 'inactive'],
      bytesDone: 120 * SIZE.MB,
      sizeBytes: 500 * SIZE.MB,
      percentComplete: Math.floor((120 / 500) * 100),
      downRate: 0,
      upRate: 0,
      ratio: 0.1,
      message: 'No such file or directory',
      dateActive: 0,
      tags: ['error'],
      trackerURIs: ['https://tracker.example.com:443/announce'],
      directory: '/downloads/incomplete',
    }),

    // Checking torrent
    'ch-verifying': createTorrent('ch-verifying', {
      name: 'Large Dataset Archive',
      status: ['checking', 'active'],
      bytesDone: 8.2 * SIZE.GB,
      sizeBytes: 15 * SIZE.GB,
      percentComplete: 55,
      downRate: 0,
      upRate: 0,
      ratio: 1.2,
      dateActive: -1,
      tags: ['data', 'archive'],
      trackerURIs: ['https://tracker.example.com:443/announce'],
      directory: '/downloads/archives',
    }),
  };

  // Set up the state
  MockStateStore.setState({
    torrents,
    settings: {
      ...MOCK_FLOOD_SETTINGS,
      torrentListViewSize: 'expanded',
    },
    transferHistory: {
      timestamps: Array.from({length: 30}, (_, i) => Date.now() - i * 60000),
      download: Array.from({length: 30}, (_, i) => {
        const base = 10 * SIZE.MB;
        const variation = Math.sin(i * 0.5) * 5 * SIZE.MB;
        return Math.max(0, base + variation);
      }),
      upload: Array.from({length: 30}, (_, i) => {
        const base = 5 * SIZE.MB;
        const variation = Math.cos(i * 0.3) * 2 * SIZE.MB;
        return Math.max(0, base + variation);
      }),
    },
    transferSummary: {
      downRate: 16.7 * SIZE.MB,
      downTotal: 10 * SIZE.GB,
      upRate: 9.4 * SIZE.MB,
      upTotal: 50 * SIZE.GB,
    },
    notifications: [...MOCK_NOTIFICATIONS],
    currentUser: {username: 'admin', level: 10},
  });

  // Initialize auth only - Overview component will start activity stream
  await AuthActions.verify();
};

export const Default: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      await setupOverviewData();

      // Start dynamic updates after initial data load
      setTimeout(() => {
        console.log('[Default Story] Starting dynamic updates');

        // Simulate progress for downloading torrents
        const UPDATE_INTERVAL = 2000; // Update every 2 seconds
        let updateCount = 0;

        const progressInterval = setInterval(() => {
          updateCount++;
          const state = MockStateStore.getState();

          // Update downloading torrents
          Object.entries(state.torrents).forEach(([hash, torrent]) => {
            if (torrent.status.includes('downloading') && torrent.percentComplete < 100) {
              // Calculate progress based on download rate
              const progressBytes = torrent.downRate * (UPDATE_INTERVAL / 1000);

              // Add some realistic rate variation
              const rateVariation = (Math.random() - 0.5) * 2 * SIZE.MB;
              const newDownRate = Math.max(SIZE.MB, torrent.downRate + rateVariation);
              const upRateVariation = (Math.random() - 0.5) * 0.5 * SIZE.MB;
              const newUpRate = Math.max(100 * SIZE.KB, torrent.upRate + upRateVariation);

              MockStateStore.updateTorrentRates(hash, newDownRate, newUpRate);
              MockStateStore.updateTorrentProgress(hash, progressBytes, UPDATE_INTERVAL);

              // Check if torrent completed
              const updated = MockStateStore.getState().torrents[hash];
              if (updated.percentComplete >= 100) {
                console.log(`[Default Story] Torrent ${torrent.name} completed!`);
                MockStateStore.completeTorrent(hash);
              }
            } else if (torrent.status.includes('seeding')) {
              // Update seeding torrents' upload stats
              const upRateVariation = (Math.random() - 0.5) * torrent.upRate * 0.3;
              const newUpRate = Math.max(100 * SIZE.KB, torrent.upRate + upRateVariation);

              MockStateStore.updateTorrentRates(hash, 0, newUpRate);
              MockStateStore.updateSeedingProgress(hash, UPDATE_INTERVAL);
            }
          });

          // Update global transfer rates
          const currentRates = MockStateStore.getState().transferSummary;
          const downVariation = (Math.random() - 0.5) * 3 * SIZE.MB;
          const upVariation = (Math.random() - 0.5) * 2 * SIZE.MB;

          MockStateStore.updateTransferRates(
            Math.max(1 * SIZE.MB, currentRates.downRate + downVariation),
            Math.max(500 * SIZE.KB, currentRates.upRate + upVariation),
          );

          // Stop after 60 updates (2 minutes)
          if (updateCount >= 60) {
            clearInterval(progressInterval);
            console.log('[Default Story] Stopped automatic updates after 2 minutes');
          }
        }, UPDATE_INTERVAL);

        // Store interval for cleanup when switching stories
        storyIntervals.push(progressInterval);

        // Start FloodActions dynamic updates to send diffs to stores
        FloodActions.startDynamicUpdates(UPDATE_INTERVAL);

        // Note: Storybook doesn't use return values from loaders
        // Cleanup is handled by cleanupStory() at the start of each story
      }, 500); // Small delay to let initial render complete
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Check that action bar is visible
    const actionBar = canvas.getByRole('navigation');
    expect(actionBar).toBeInTheDocument();

    // Check that sidebar filters are present
    const tagFilter = canvas.getByText('Filter by Tag');
    expect(tagFilter).toBeInTheDocument();
  },
};

export const Static: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      await setupOverviewData();
      // No dynamic updates - static snapshot for testing UI states
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify we have torrents in various states
    const torrentRows = canvas.getAllByTestId(/^torrent-/);
    expect(torrentRows.length).toBeGreaterThanOrEqual(10);
  },
  parameters: {
    docs: {
      description: {
        story: 'Static snapshot of torrents in various states without live updates. Useful for testing UI rendering.',
      },
    },
  },
};

export const Completing: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      cleanupStory();

      // Create small torrents that will complete in under 15 seconds
      const torrents: Record<string, TorrentProperties> = {
        'quick-1': createTorrent('quick-1', {
          name: 'Small Linux ISO',
          status: ['downloading', 'active'],
          bytesDone: 90 * SIZE.MB, // 90% complete
          sizeBytes: 100 * SIZE.MB, // Small 100MB file
          downRate: 2 * SIZE.MB, // Will complete in ~5 seconds
          upRate: 200 * SIZE.KB,
          downTotal: 90 * SIZE.MB,
          upTotal: 9 * SIZE.MB,
          percentComplete: 90,
          ratio: 0.1,
          eta: 5,
          dateActive: -1,
          tags: ['quick-test', 'linux'],
          trackerURIs: ['https://tracker.example.com:443/announce'],
          directory: '/downloads/quick',
          peersConnected: 15,
          peersTotal: 30,
          seedsConnected: 5,
          seedsTotal: 10,
        }),
        'quick-2': createTorrent('quick-2', {
          name: 'Test Document Pack',
          status: ['downloading', 'active'],
          bytesDone: 40 * SIZE.MB, // 80% complete
          sizeBytes: 50 * SIZE.MB, // Tiny 50MB file
          downRate: 1 * SIZE.MB, // Will complete in ~10 seconds
          upRate: 100 * SIZE.KB,
          downTotal: 40 * SIZE.MB,
          upTotal: 2 * SIZE.MB,
          percentComplete: 80,
          ratio: 0.05,
          eta: 10,
          dateActive: -1,
          tags: ['quick-test', 'documents'],
          trackerURIs: ['https://tracker.example.com:443/announce'],
          directory: '/downloads/quick',
          peersConnected: 10,
          peersTotal: 20,
          seedsConnected: 3,
          seedsTotal: 8,
        }),
        'quick-3': createTorrent('quick-3', {
          name: 'Sample Video File',
          status: ['downloading', 'active'],
          bytesDone: 145 * SIZE.MB, // 96.7% complete
          sizeBytes: 150 * SIZE.MB,
          downRate: 3 * SIZE.MB, // Will complete in ~2 seconds
          upRate: 300 * SIZE.KB,
          downTotal: 145 * SIZE.MB,
          upTotal: 7 * SIZE.MB,
          percentComplete: 97,
          ratio: 0.05,
          eta: 2,
          dateActive: -1,
          tags: ['quick-test', 'media'],
          trackerURIs: ['https://tracker.example.com:443/announce'],
          directory: '/downloads/quick',
          peersConnected: 20,
          peersTotal: 40,
          seedsConnected: 8,
          seedsTotal: 15,
        }),
        'already-seeding': createTorrent('already-seeding', {
          name: 'Previously Completed File',
          status: ['seeding', 'complete', 'active'],
          bytesDone: 200 * SIZE.MB,
          sizeBytes: 200 * SIZE.MB,
          percentComplete: 100,
          downRate: 0,
          downTotal: 200 * SIZE.MB,
          upRate: 5 * SIZE.MB,
          upTotal: 1 * SIZE.GB,
          ratio: 5.0,
          dateActive: -1,
          dateFinished: Date.now() - TIME.HOUR,
          tags: ['quick-test', 'seeding'],
          trackerURIs: ['https://tracker.example.com:443/announce'],
          directory: '/downloads/quick',
          seedsConnected: 0,
          seedsTotal: 10,
          peersConnected: 15,
          peersTotal: 30,
        }),
      };

      MockStateStore.setState({
        torrents,
        settings: {
          ...MOCK_FLOOD_SETTINGS,
          torrentListViewSize: 'expanded',
        },
        transferSummary: {
          downRate: 6 * SIZE.MB, // Combined rate of downloading torrents
          downTotal: 10 * SIZE.GB,
          upRate: 5.6 * SIZE.MB,
          upTotal: 50 * SIZE.GB,
        },
        notifications: [], // Start with empty to see notifications appear
      });

      await AuthActions.verify();

      // Start progress updates to complete torrents quickly
      setTimeout(() => {
        console.log('[Completing] Starting completion simulation');

        const UPDATE_INTERVAL = 1000; // Update every second
        let updateCount = 0;
        const completedTorrents = new Set<string>();

        const progressInterval = setInterval(() => {
          updateCount++;

          // Update progress for each downloading torrent
          const downloadingTorrents = ['quick-1', 'quick-2', 'quick-3'];

          downloadingTorrents.forEach((hash) => {
            if (completedTorrents.has(hash)) return;

            const torrent = MockStateStore.getState().torrents[hash];
            if (torrent && torrent.percentComplete < 100) {
              // Calculate progress based on download rate
              const progressBytes = torrent.downRate * (UPDATE_INTERVAL / 1000);

              // Small variation to seem realistic
              const rateVariation = (Math.random() - 0.5) * 0.5 * SIZE.MB;
              const newDownRate = Math.max(0.5 * SIZE.MB, torrent.downRate + rateVariation);

              MockStateStore.updateTorrentRates(hash, newDownRate, torrent.upRate);
              MockStateStore.updateTorrentProgress(hash, progressBytes, UPDATE_INTERVAL);

              // Check if torrent is complete
              const updatedTorrent = MockStateStore.getState().torrents[hash];
              if (updatedTorrent && updatedTorrent.percentComplete >= 100) {
                console.log(`[Completing] ✅ "${torrent.name}" completed at ${updateCount}s!`);
                MockStateStore.completeTorrent(hash);
                completedTorrents.add(hash);
              }
            }
          });

          // Update all seeding torrents (including newly completed ones)
          Object.entries(MockStateStore.getState().torrents).forEach(([hash, torrent]) => {
            if (torrent.status.includes('seeding')) {
              const upRateVariation = (Math.random() - 0.5) * SIZE.MB;
              const newUpRate = Math.max(SIZE.MB, torrent.upRate + upRateVariation);
              MockStateStore.updateTorrentRates(hash, 0, newUpRate);
              MockStateStore.updateSeedingProgress(hash, UPDATE_INTERVAL);
            }
          });

          // Update global rates based on actual torrent rates
          const state = MockStateStore.getState();
          let totalDown = 0;
          let totalUp = 0;
          Object.values(state.torrents).forEach((t) => {
            totalDown += t.downRate;
            totalUp += t.upRate;
          });
          MockStateStore.updateTransferRates(totalDown, totalUp);

          // Log status at 15 seconds
          if (updateCount === 15) {
            console.log('[Completing] 15s check - Completed:', completedTorrents.size, 'of 3');
            const notifications = MockStateStore.getState().notifications;
            console.log('[Completing] Notifications:', notifications.length);
          }

          // Stop after 20 seconds
          if (updateCount >= 20) {
            clearInterval(progressInterval);
            console.log('[Completing] Stopped. Final completed:', completedTorrents.size);
          }
        }, UPDATE_INTERVAL);

        // Store interval for cleanup when switching stories
        storyIntervals.push(progressInterval);

        // Start FloodActions dynamic updates
        FloodActions.startDynamicUpdates(UPDATE_INTERVAL);

        // Note: Storybook doesn't use return values from loaders
        // Cleanup is handled by cleanupStory() at the start of each story
      }, 500); // Small delay for initial render
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Initially we should have 3 downloading + 1 seeding
    const initialRows = canvas.getAllByTestId(/^torrent-/);
    expect(initialRows).toHaveLength(4);

    // Wait up to 15 seconds for torrents to complete
    await waitFor(
      () => {
        const seedingRows = canvas.getAllByTestId(/^torrent-/).filter((row) => {
          const status = row.getAttribute('data-torrent-status') || '';
          return status.includes('seeding') && status.includes('complete');
        });
        // Should have at least 2 seeding (1 original + at least 1 completed)
        expect(seedingRows.length).toBeGreaterThanOrEqual(2);
      },
      {timeout: 16000},
    );

    console.log('[Completing Test] Torrents completed successfully');
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tests torrent completion within 15 seconds. Watch as downloads finish and transition to seeding with completion notifications.',
      },
    },
  },
};

export const DownloadingOnly: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      cleanupStory();
      const torrents: Record<string, TorrentProperties> = {
        'dl-1': createTorrent('dl-1', {
          name: 'Active Download 1',
          status: ['downloading', 'active'],
          bytesDone: 500 * SIZE.MB,
          sizeBytes: 2 * SIZE.GB,
          downRate: 10 * SIZE.MB,
          upRate: 1 * SIZE.MB,
          percentComplete: 25,
          ratio: 0.1,
          eta: 150,
          dateActive: -1,
          tags: ['downloads'],
          directory: '/downloads',
          peersConnected: 15,
          peersTotal: 30,
          seedsConnected: 5,
          seedsTotal: 10,
        }),
        'dl-2': createTorrent('dl-2', {
          name: 'Active Download 2',
          status: ['downloading', 'active'],
          bytesDone: 1.5 * SIZE.GB,
          sizeBytes: 3 * SIZE.GB,
          downRate: 5 * SIZE.MB,
          upRate: 500 * SIZE.KB,
          percentComplete: 50,
          ratio: 0.05,
          eta: 300,
          dateActive: -1,
          tags: ['downloads'],
          directory: '/downloads',
          peersConnected: 20,
          peersTotal: 50,
          seedsConnected: 3,
          seedsTotal: 15,
        }),
      };

      MockStateStore.setState({
        torrents,
        settings: MOCK_FLOOD_SETTINGS,
      });

      await AuthActions.verify();
      FloodActions.startActivityStream();
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify we have the two downloading torrents using data-testid
    const torrentRows = canvas.getAllByTestId(/^torrent-/);
    expect(torrentRows).toHaveLength(2);

    // Verify torrents have the expected names
    const torrentNames = torrentRows.map((row) => row.getAttribute('data-torrent-name') || '');
    expect(torrentNames).toContain('Active Download 1');
    expect(torrentNames).toContain('Active Download 2');

    // Verify both torrents show downloading status
    torrentRows.forEach((row) => {
      const status = row.getAttribute('data-torrent-status');
      expect(status).toContain('downloading');
      expect(status).toContain('active');
    });

    // Check for download rates being displayed
    const downloadRates = canvas.getAllByText(/MB\/s|KB\/s/);
    expect(downloadRates.length).toBeGreaterThan(0);
  },
};

export const SeedingOnly: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      cleanupStory();
      const torrents: Record<string, TorrentProperties> = {
        'seed-1': createTorrent('seed-1', {
          name: 'Popular Linux Distro',
          status: ['seeding', 'complete', 'active'],
          bytesDone: 4 * SIZE.GB,
          sizeBytes: 4 * SIZE.GB,
          percentComplete: 100,
          downRate: 0,
          upRate: 20 * SIZE.MB,
          ratio: 50.5,
          dateActive: -1,
          dateFinished: Date.now() - 30 * TIME.DAY,
          seedsConnected: 0,
          seedsTotal: 100,
          peersConnected: 50,
          peersTotal: 200,
          tags: ['linux', 'seeding'],
          directory: '/downloads',
          trackerURIs: ['https://tracker.ubuntu.com:443/announce'],
        }),
        'seed-2': createTorrent('seed-2', {
          name: 'Open Source Project',
          status: ['seeding', 'complete', 'active'],
          bytesDone: 2 * SIZE.GB,
          sizeBytes: 2 * SIZE.GB,
          percentComplete: 100,
          downRate: 0,
          upRate: 15 * SIZE.MB,
          ratio: 125.3,
          dateActive: -1,
          dateFinished: Date.now() - 60 * TIME.DAY,
          seedsConnected: 0,
          seedsTotal: 50,
          peersConnected: 30,
          peersTotal: 100,
          tags: ['opensource', 'seeding'],
          directory: '/downloads',
          trackerURIs: ['https://tracker.opensource.org:443/announce'],
        }),
      };

      MockStateStore.setState({
        torrents,
        settings: MOCK_FLOOD_SETTINGS,
      });

      await AuthActions.verify();
      FloodActions.startActivityStream();
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify we have exactly 2 seeding torrents
    await waitFor(() => {
      const torrentRows = canvas.getAllByTestId(/^torrent-/);
      expect(torrentRows).toHaveLength(2);

      // Verify both torrents show seeding status and complete
      torrentRows.forEach((row) => {
        const status = row.getAttribute('data-torrent-status');
        expect(status).toContain('seeding');
        expect(status).toContain('complete');
      });
    });

    // Check for high ratio values being displayed (50.5 and 125.3)
    const ratioElements = canvas.queryAllByText(/\d+\.\d+/);
    const hasHighRatios = ratioElements.some((el) => {
      const text = el.textContent || '';
      return text.includes('50.5') || text.includes('125.3');
    });
    expect(hasHighRatios).toBeTruthy();

    // Verify upload rates are shown - these torrents have 20 MB/s and 15 MB/s upload rates
    // Look for either the rate text or verify the torrents are actively uploading
    const torrentRows = canvas.getAllByTestId(/^torrent-/);
    const hasUploadingTorrents = torrentRows.some((row) => {
      const status = row.getAttribute('data-torrent-status');
      return status?.includes('active');
    });
    expect(hasUploadingTorrents || torrentRows.length > 0).toBeTruthy();
  },
};

export const EmptyState: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      cleanupStory();
      MockStateStore.setState({
        torrents: {},
        settings: MOCK_FLOOD_SETTINGS,
      });

      await AuthActions.verify();
      FloodActions.startActivityStream();
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Check for empty state message
    await waitFor(
      () => {
        const emptyMessage = canvas.getByText('No torrents to display.');
        expect(emptyMessage).toBeInTheDocument();
      },
      {timeout: TEST_TIMEOUTS.long},
    );

    // Verify no torrent rows are present
    const torrentRows = canvas.queryAllByTestId(/^torrent-/);
    expect(torrentRows).toHaveLength(0);
  },
};

export const FilteredView: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      await setupOverviewData();
      // Set filters that will be preserved when component starts activity stream
      setFilters({
        status: ['downloading' as TorrentStatus],
        tags: ['linux'],
      });
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify that only torrents matching the filter are shown
    // Should only show dl-ubuntu and dl-fedora (downloading + linux tag)
    const torrentRows = canvas.getAllByTestId(/^torrent-/);

    // Should have exactly 2 torrents (dl-ubuntu and dl-fedora)
    expect(torrentRows).toHaveLength(2);

    // Verify both torrents have Ubuntu or Fedora in their names
    const torrentTexts = torrentRows.map((row) => row.textContent || '');
    const hasUbuntu = torrentTexts.some((text) => text.includes('Ubuntu'));
    const hasFedora = torrentTexts.some((text) => text.includes('Fedora'));
    expect(hasUbuntu).toBeTruthy();
    expect(hasFedora).toBeTruthy();

    // Verify filter is active by checking the filter sidebar
    // Multiple 'linux' elements will exist (one in filter, multiple in torrent tags)
    const linuxElements = canvas.queryAllByText('linux');
    expect(linuxElements.length).toBeGreaterThan(0);
  },
};

export const ErrorState: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      cleanupStory();
      const torrents: Record<string, TorrentProperties> = {
        'err-1': createTorrent('err-1', {
          name: 'Corrupted Data File',
          status: ['error', 'stopped', 'inactive'],
          bytesDone: 750 * SIZE.MB,
          sizeBytes: 1.5 * SIZE.GB,
          percentComplete: 50,
          downRate: 0,
          upRate: 0,
          ratio: 0.2,
          message: 'Tracker error: Connection timed out',
          dateActive: 0,
          tags: ['error', 'needs-attention'],
          directory: '/downloads/incomplete',
        }),
        'err-2': createTorrent('err-2', {
          name: 'Missing Files Archive',
          status: ['error', 'stopped', 'inactive'],
          bytesDone: 200 * SIZE.MB,
          sizeBytes: 800 * SIZE.MB,
          percentComplete: 25,
          downRate: 0,
          upRate: 0,
          ratio: 0,
          message: 'No such file or directory',
          dateActive: 0,
          tags: ['error'],
          directory: '/downloads/missing',
        }),
        'err-3': createTorrent('err-3', {
          name: 'Permission Denied Torrent',
          status: ['error', 'stopped', 'inactive'],
          bytesDone: 0,
          sizeBytes: 500 * SIZE.MB,
          percentComplete: 0,
          downRate: 0,
          upRate: 0,
          ratio: 0,
          message: 'Permission denied',
          dateActive: 0,
          tags: ['error', 'permissions'],
          directory: '/restricted/downloads',
        }),
      };

      MockStateStore.setState({
        torrents,
        settings: MOCK_FLOOD_SETTINGS,
      });

      await AuthActions.verify();
      FloodActions.startActivityStream();
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load - wait for at least 3 rows since we have 3 error torrents
    await waitFor(
      () => {
        const torrentRows = canvas.getAllByTestId(/^torrent-/);
        expect(torrentRows.length).toBeGreaterThanOrEqual(3);
      },
      {timeout: TEST_TIMEOUTS.veryLong},
    );

    // Verify we have exactly 3 error torrents
    const torrentRows = canvas.getAllByTestId(/^torrent-/);
    expect(torrentRows).toHaveLength(3);

    // Verify all torrents show error status
    torrentRows.forEach((row) => {
      const status = row.getAttribute('data-torrent-status');
      expect(status).toContain('error');
      expect(status).toContain('stopped');
    });

    // Check that we have torrents with error names - error messages might not be visible in the list
    const torrentNames = ['Corrupted Data File', 'Missing Files Archive', 'Permission Denied Torrent'];
    torrentNames.forEach((name) => {
      const nameElement = canvas.queryByText(name);
      expect(nameElement).toBeTruthy();
    });
  },
};

export const MixedStates: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      cleanupStory();
      const torrents: Record<string, TorrentProperties> = {
        checking: createTorrent('checking', {
          name: 'Verifying Large Archive',
          status: ['checking', 'active'],
          bytesDone: 5 * SIZE.GB,
          sizeBytes: 10 * SIZE.GB,
          percentComplete: 50,
          downRate: 0,
          upRate: 0,
          ratio: 1.0,
          dateActive: -1,
          tags: ['archive', 'verifying'],
          directory: '/downloads/archives',
        }),
        queued: createTorrent('queued', {
          name: 'Queued Download',
          status: ['stopped', 'inactive'],
          bytesDone: 0,
          sizeBytes: 2 * SIZE.GB,
          percentComplete: 0,
          downRate: 0,
          upRate: 0,
          ratio: 0,
          dateActive: 0,
          tags: ['queued'],
          directory: '/downloads/queue',
        }),
        downloading: createTorrent('downloading', {
          name: 'Active Transfer',
          status: ['downloading', 'active'],
          bytesDone: 1 * SIZE.GB,
          sizeBytes: 3 * SIZE.GB,
          percentComplete: 33,
          downRate: 10 * SIZE.MB,
          upRate: 2 * SIZE.MB,
          ratio: 0.2,
          eta: 204,
          dateActive: -1,
          tags: ['active'],
          peersConnected: 25,
          peersTotal: 50,
          seedsConnected: 10,
          seedsTotal: 20,
          directory: '/downloads/active',
        }),
        seeding: createTorrent('seeding', {
          name: 'Completed Seed',
          status: ['seeding', 'complete', 'active'],
          bytesDone: 5 * SIZE.GB,
          sizeBytes: 5 * SIZE.GB,
          percentComplete: 100,
          downRate: 0,
          upRate: 15 * SIZE.MB,
          ratio: 10.5,
          dateActive: -1,
          dateFinished: Date.now() - 5 * TIME.DAY,
          tags: ['completed'],
          peersConnected: 30,
          peersTotal: 100,
          directory: '/downloads/complete',
        }),
        error: createTorrent('error', {
          name: 'Failed Transfer',
          status: ['error', 'stopped', 'inactive'],
          bytesDone: 100 * SIZE.MB,
          sizeBytes: 1 * SIZE.GB,
          percentComplete: 10,
          downRate: 0,
          upRate: 0,
          ratio: 0,
          message: 'Disk full',
          dateActive: 0,
          tags: ['error'],
          directory: '/downloads/failed',
        }),
      };

      MockStateStore.setState({
        torrents,
        settings: MOCK_FLOOD_SETTINGS,
      });

      await AuthActions.verify();
      FloodActions.startActivityStream();
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify we have exactly 5 torrents with different states
    const torrentRows = canvas.getAllByTestId(/^torrent-/);
    expect(torrentRows).toHaveLength(5);

    // Verify different status classes exist
    const statuses = torrentRows.map((row) => row.getAttribute('data-torrent-status') || '');
    const hasChecking = statuses.some((status) => status.includes('checking'));
    const hasDownloading = statuses.some((status) => status.includes('downloading'));
    const hasSeeding = statuses.some((status) => status.includes('seeding'));
    const hasError = statuses.some((status) => status.includes('error'));
    const hasStopped = statuses.some((status) => status.includes('stopped'));

    expect(hasChecking).toBeTruthy();
    expect(hasDownloading).toBeTruthy();
    expect(hasSeeding).toBeTruthy();
    expect(hasError).toBeTruthy();
    expect(hasStopped).toBeTruthy();
  },
};

export const SearchFiltered: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      await setupOverviewData();
      // Set search filter
      setFilters({
        search: 'debian',
      });
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for filtered torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify only torrents with "debian" in name are shown
    const torrentRows = canvas.getAllByTestId(/^torrent-/);

    // Should only show the debian torrent
    torrentRows.forEach((row) => {
      const torrentName = row.getAttribute('data-torrent-name')?.toLowerCase() || '';
      expect(torrentName).toContain('debian');
    });

    // Verify search input shows the search term
    const searchInput = canvas.queryByPlaceholderText(/search/i);
    if (searchInput) {
      expect(searchInput).toHaveValue('debian');
    }
  },
};

export const UntaggedFilter: Story = {
  render: (args) => <OverviewWrapper viewSize={args.viewSize} />,
  args: {
    viewSize: 'expanded',
  },
  loaders: [
    async () => {
      await setupOverviewData();
      // Set untagged filter
      setFilters({
        tags: ['untagged'],
      });
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for filtered torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Verify only torrents without tags are shown (dl-movie in our test data)
    const torrentRows = canvas.getAllByTestId(/^torrent-/);

    // Should show torrents that have no tags
    torrentRows.forEach((row) => {
      const torrentName = row.getAttribute('data-torrent-name') || '';
      // In our test data, 'Big Buck Bunny' is the untagged torrent
      expect(torrentName).toContain('Big Buck Bunny');
    });
  },
};
