import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect} from 'storybook/test';

import TorrentListRow from './TorrentListRow';
import {MOCK_TORRENT_STATES} from '../../../../../.storybook/mocks/_fixtures';
import TorrentStore from '@client/stores/TorrentStore';
import FloodActions from '@client/actions/FloodActions';
import MockStateStore from '../../../../../.storybook/mocks/MockStateStore';

const meta: Meta<typeof TorrentListRow> = {
  title: 'Components/TorrentList/TorrentListRow',
  component: TorrentListRow,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{width: '100%', minHeight: '100px', position: 'relative'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to setup torrent data before rendering
 */
const setupTorrent = (torrentState: any, viewSize: 'expanded' | 'condensed' = 'expanded', extraSetup?: () => void) => ({
  args: {
    hash: torrentState.hash,
    style: {},
  },
  loaders: [
    async () => {
      // Reset state and set mock data for this specific story
      MockStateStore.reset();
      MockStateStore.setState({
        torrents: {[torrentState.hash]: torrentState},
        settings: {
          ...MockStateStore.getState().settings,
          torrentListViewSize: viewSize,
        },
      });
      // Trigger data load
      console.log('[Story] About to call FloodActions.startActivityStream');
      console.log('[Story] FloodActions:', FloodActions);
      console.log('[Story] FloodActions.startActivityStream:', FloodActions.startActivityStream);
      FloodActions.startActivityStream();
      console.log('[Story] Called FloodActions.startActivityStream');

      // Wait for the torrent list to be populated (proper async pattern)
      await new Promise<void>((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 1 second total (100 * 10ms)

        const checkInterval = setInterval(() => {
          attempts++;

          // Check if TorrentStore has been populated
          if (TorrentStore.torrents && Object.keys(TorrentStore.torrents).length > 0) {
            console.log('[Story] TorrentStore populated after', attempts * 10, 'ms');
            clearInterval(checkInterval);
            resolve();
          } else if (attempts >= maxAttempts) {
            console.warn('[Story] Timeout waiting for TorrentStore population');
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      });
      // Run any extra setup (like selecting torrents)
      if (extraSetup) {
        extraSetup();
      }
    },
  ],
});

// ====== EXPANDED VIEW STORIES ======

export const ExpandedDownloading: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');

    // Verify the torrent has downloading class
    expect(torrentRow).toHaveClass('torrent--is-downloading');
    expect(torrentRow).toHaveClass('torrent--is-downloading--actively');
  },
};

export const ExpandedSeeding: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.seeding, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');
    expect(torrentRow).toHaveClass('torrent--is-seeding');
    expect(torrentRow).toHaveClass('torrent--is-uploading--actively');
  },
};

export const ExpandedStopped: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.stopped, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');
    expect(torrentRow).toHaveClass('torrent--is-stopped');
  },
};

export const ExpandedError: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.error, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');
    expect(torrentRow).toHaveClass('torrent--has-error');
  },
};

export const ExpandedSelected: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'expanded', () => {
    TorrentStore.selectedTorrents = [MOCK_TORRENT_STATES.downloading.hash];
  }),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');
    expect(torrentRow).toHaveClass('torrent--is-selected');
  },
};

// ====== CONDENSED VIEW STORIES ======

export const CondensedDownloading: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'condensed'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');
    expect(torrentRow).toHaveClass('torrent--is-condensed');
    expect(torrentRow).toHaveClass('torrent--is-downloading');
  },
};

export const CondensedSeeding: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.seeding, 'condensed'),
};

export const CondensedSelected: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'condensed', () => {
    TorrentStore.selectedTorrents = [MOCK_TORRENT_STATES.downloading.hash];
  }),
};

// ====== COMBINED STATE STORIES ======

export const ErrorAndStopped: Story = {
  ...setupTorrent(
    {
      ...MOCK_TORRENT_STATES.error,
      status: ['error', 'stopped'],
      hash: 'error-stopped',
    },
    'expanded',
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');
    expect(torrentRow).toHaveClass('torrent--has-error');
    expect(torrentRow).toHaveClass('torrent--is-stopped');
  },
};

const selectedErrorStoppedTorrent = {
  ...MOCK_TORRENT_STATES.error,
  status: ['error', 'stopped'] as any,
  hash: 'selected-error-stopped',
};

export const SelectedErrorStopped: Story = {
  ...setupTorrent(selectedErrorStoppedTorrent, 'expanded', () => {
    TorrentStore.selectedTorrents = [selectedErrorStoppedTorrent.hash];
  }),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByRole('row');

    // Verify all classes are applied
    expect(torrentRow).toHaveClass('torrent--is-selected');
    expect(torrentRow).toHaveClass('torrent--has-error');
    expect(torrentRow).toHaveClass('torrent--is-stopped');
  },
};
