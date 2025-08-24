/**
 * Overview Route Story
 * Shows the complete application overview with torrents, sidebar, and action bar
 */

import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect, waitFor} from 'storybook/test';

import Overview from './Overview';
import FloodActions from '@client/actions/FloodActions';
import AuthActions from '@client/actions/AuthActions';
import type {TorrentProperties} from '@shared/types/Torrent';
import {TorrentPriority} from '@shared/types/Torrent';

// Import mocks using relative paths since they're not in the webpack alias
import MockStateStore from '../../../../.storybook/mocks/MockStateStore';
import {
  MOCK_TORRENT_STATES,
  MOCK_FLOOD_SETTINGS,
  MOCK_NOTIFICATIONS,
  SIZE,
  TIME,
} from '../../../../.storybook/mocks/_fixtures';

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
};

export default meta;
type Story = StoryObj<typeof meta>;

// Direct component without router wrapper - Storybook provides the router
import {observer} from 'mobx-react';

const OverviewWrapper = observer(() => <Overview />);

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

const setupOverviewData = async () => {
  MockStateStore.reset();

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

  // Initialize auth and start activity stream
  await AuthActions.verify();
  FloodActions.startActivityStream();
};

export const Default: Story = {
  render: () => <OverviewWrapper />,
  loaders: [setupOverviewData],
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
    const tagFilter = canvas.getByLabelText('filter.tag.title');
    expect(tagFilter).toBeInTheDocument();
  },
};

export const CondensedView: Story = {
  render: () => <OverviewWrapper />,
  loaders: [
    async () => {
      await setupOverviewData();
      MockStateStore.setState({
        settings: {
          ...MOCK_FLOOD_SETTINGS,
          torrentListViewSize: 'condensed',
        },
      });
      FloodActions.startActivityStream();
    },
  ],
};

export const DownloadingOnly: Story = {
  render: () => <OverviewWrapper />,
  loaders: [
    async () => {
      MockStateStore.reset();
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
};

export const EmptyState: Story = {
  render: () => <OverviewWrapper />,
  loaders: [
    async () => {
      MockStateStore.reset();
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
    await waitFor(() => {
      const emptyMessage = canvas.getByText('torrents.list.no.torrents');
      expect(emptyMessage).toBeInTheDocument();
    });
  },
};

export const FilteredView: Story = {
  render: () => <OverviewWrapper />,
  loaders: [setupOverviewData],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrents to load
    await waitFor(() => {
      const torrents = canvas.queryAllByRole('row');
      expect(torrents.length).toBeGreaterThan(0);
    });

    // Note: Actual filtering would require clicking on filter items
    // This story just shows the initial state with filters available
  },
};

export const HighRatioSeeding: Story = {
  render: () => <OverviewWrapper />,
  loaders: [
    async () => {
      MockStateStore.reset();
      const torrents: Record<string, TorrentProperties> = {
        'hr-1': createTorrent('hr-1', {
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
        }),
        'hr-2': createTorrent('hr-2', {
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
};
