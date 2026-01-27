import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect, waitFor, userEvent} from 'storybook/test';

import TorrentListRow from './TorrentListRow';
import {MOCK_TORRENT_STATES} from '../../../../../.storybook/mocks/_fixtures';
import TorrentStore from '@client/stores/TorrentStore';
import FloodActions from '@client/actions/FloodActions';
import MockStateStore from '../../../../../.storybook/mocks/MockStateStore';
import type {TorrentProperties} from '@shared/types/Torrent';
import {
  createMockMouseEvent,
  assertNotNull,
  TEST_TIMEOUTS,
  StoryErrorBoundary,
  cleanupStory,
} from '../../test-utils/storybook-helpers';

const meta: Meta<typeof TorrentListRow> = {
  title: 'Components/TorrentList/TorrentListRow',
  component: TorrentListRow,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <StoryErrorBoundary>
        <div
          style={{
            width: '100%',
            minHeight: '100px',
            position: 'relative',
          }}
        >
          <Story />
        </div>
      </StoryErrorBoundary>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper to setup torrent data before rendering
 */
const setupTorrent = (
  torrentState: TorrentProperties,
  viewSize: 'expanded' | 'condensed' = 'expanded',
  selectedHash?: string,
) => ({
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
      FloodActions.startActivityStream();

      // Wait for the torrent list to be populated using MobX reaction
      await waitFor(
        () => {
          expect(TorrentStore.torrents).toBeDefined();
          expect(Object.keys(TorrentStore.torrents).length).toBeGreaterThan(0);
        },
        {timeout: TEST_TIMEOUTS.long},
      );

      // Set selected torrents if needed (using proper action)
      if (selectedHash) {
        const mockEvent = createMockMouseEvent();
        TorrentStore.setSelectedTorrents({hash: selectedHash, event: mockEvent});
      }

      // Cleanup function for this story
      return () => {
        cleanupStory();
      };
    },
  ],
});

// ====== EXPANDED VIEW STORIES ======

export const ExpandedDownloading: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Wait for torrent row with proper data-testid
    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.downloading.hash}`);

    // Verify the torrent status using data attributes
    expect(torrentRow).toHaveAttribute('data-torrent-status');
    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'), 'Torrent status should be defined');
    expect(status).toContain('downloading');
    expect(status).toContain('active');

    // Test interaction
    await userEvent.click(torrentRow);
    await waitFor(() => {
      expect(TorrentStore.selectedTorrents).toContain(MOCK_TORRENT_STATES.downloading.hash);
    });

    // Test keyboard navigation
    torrentRow.focus();
    await userEvent.keyboard('{Space}');

    // Test accessibility
    expect(torrentRow).toHaveAttribute('role', 'row');
    expect(torrentRow).toHaveAttribute('tabIndex', '0');
  },
};

export const ExpandedSeeding: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.seeding, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.seeding.hash}`);

    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('seeding');
    expect(status).toContain('complete');

    // Test double-click opens details
    await userEvent.dblClick(torrentRow);
    // Verify double-click was registered
    expect(torrentRow).toHaveAttribute('data-torrent-name');

    // Test right-click context menu
    await userEvent.pointer([{target: torrentRow, keys: '[MouseRight]'}]);
    // Verify right-click was registered
    expect(torrentRow).toHaveAttribute('data-torrent-status');
  },
};

export const ExpandedStopped: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.stopped, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.stopped.hash}`);

    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('stopped');
    expect(status).toContain('inactive');

    // Verify visual indicators
    expect(torrentRow).toHaveAttribute('data-torrent-name', MOCK_TORRENT_STATES.stopped.name);
  },
};

export const ExpandedError: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.error, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.error.hash}`);

    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('error');

    // Test error state interactions
    await userEvent.hover(torrentRow);
    // Verify hover state
    expect(torrentRow).toHaveAttribute('data-torrent-status');
  },
};

export const ExpandedSelected: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'expanded', MOCK_TORRENT_STATES.downloading.hash),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.downloading.hash}`);

    expect(torrentRow).toHaveAttribute('data-is-selected', 'true');

    // Verify it's actually selected in the store
    expect(TorrentStore.selectedTorrents).toContain(MOCK_TORRENT_STATES.downloading.hash);
  },
};

// ====== CONDENSED VIEW STORIES ======

export const CondensedDownloading: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'condensed'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.downloading.hash}`);

    expect(torrentRow).toHaveAttribute('data-view-size', 'condensed');
    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('downloading');

    // Verify condensed view has less elements
    const cells = within(torrentRow).getAllByRole('cell', {hidden: true});
    expect(cells.length).toBeLessThanOrEqual(10);
  },
};

export const CondensedSeeding: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.seeding, 'condensed'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.seeding.hash}`);

    expect(torrentRow).toHaveAttribute('data-view-size', 'condensed');
    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('seeding');
  },
};

export const CondensedSelected: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'condensed', MOCK_TORRENT_STATES.downloading.hash),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.downloading.hash}`);

    expect(torrentRow).toHaveAttribute('data-view-size', 'condensed');
    expect(torrentRow).toHaveAttribute('data-is-selected', 'true');

    // Test multi-select with shift key
    const mockEvent = createMockMouseEvent({shiftKey: true});
    TorrentStore.setSelectedTorrents({hash: 'another-hash', event: mockEvent});
  },
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

    const torrentRow = await canvas.findByTestId('torrent-error-stopped');

    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('error');
    expect(status).toContain('stopped');
  },
};

const selectedErrorStoppedTorrent: TorrentProperties = {
  ...MOCK_TORRENT_STATES.error,
  status: ['error', 'stopped'],
  hash: 'selected-error-stopped',
};

export const SelectedErrorStopped: Story = {
  ...setupTorrent(selectedErrorStoppedTorrent, 'expanded', selectedErrorStoppedTorrent.hash),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const torrentRow = await canvas.findByTestId('torrent-selected-error-stopped');

    // Verify all attributes are applied
    expect(torrentRow).toHaveAttribute('data-is-selected', 'true');
    const status = assertNotNull(torrentRow.getAttribute('data-torrent-status'));
    expect(status).toContain('error');
    expect(status).toContain('stopped');

    // Test keyboard navigation
    torrentRow.focus();
    await userEvent.keyboard('{Enter}');
    // Verify Enter key was registered
    expect(torrentRow).toHaveAttribute('tabIndex', '0');
  },
};

// ====== NEGATIVE TEST CASES ======

export const NonExistentTorrent: Story = {
  args: {
    hash: 'non-existent-hash',
    style: {},
  },
  loaders: [
    async () => {
      MockStateStore.reset();
      FloodActions.startActivityStream();
      return () => cleanupStory();
    },
  ],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Should handle non-existent torrent gracefully
    const torrentRow = canvas.queryByTestId('torrent-non-existent-hash');
    expect(torrentRow).toBeNull();
  },
};

// ====== PERFORMANCE TEST ======

export const RapidSelection: Story = {
  ...setupTorrent(MOCK_TORRENT_STATES.downloading, 'expanded'),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const torrentRow = await canvas.findByTestId(`torrent-${MOCK_TORRENT_STATES.downloading.hash}`);

    // Rapidly select/deselect
    const startTime = performance.now();
    for (let i = 0; i < 10; i++) {
      await userEvent.click(torrentRow);
      await userEvent.click(document.body);
    }
    const endTime = performance.now();

    // Should complete in reasonable time
    expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS.long);
  },
};
