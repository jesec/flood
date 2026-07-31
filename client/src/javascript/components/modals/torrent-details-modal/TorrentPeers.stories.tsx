import type {Meta, StoryObj} from '@storybook/react-vite';
import {within, expect, userEvent, waitFor} from 'storybook/test';

import TorrentPeers from './TorrentPeers';
import UIStore from '@client/stores/UIStore';

const meta: Meta<typeof TorrentPeers> = {
  title: 'Components/TorrentPeers',
  component: TorrentPeers,
  parameters: {
    layout: 'padded',
  },
  loaders: [
    async () => {
      UIStore.setActiveModal({id: 'torrent-details', hash: 'MOCKHASH'});
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sortable: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Mock data: 192.168.1.100 (dl 524288, ul 262144, 45%), 10.0.0.50 (dl 0, ul 1MiB, 100%), 172.16.0.25 (dl 102400, ul 51200, 78%)
    await waitFor(() => {
      expect(canvas.getByText('192.168.1.100:51234')).toBeInTheDocument();
    });

    const getRowTexts = () =>
      canvas
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.textContent);

    // Initial order matches the backend response
    expect(getRowTexts()[0]).toContain('192.168.1.100:51234');
    expect(getRowTexts()[1]).toContain('10.0.0.50:49999');
    expect(getRowTexts()[2]).toContain('172.16.0.25:6881');

    // Click DL heading -> sort by downloadRate in descending order
    await userEvent.click(canvas.getByRole('button', {name: 'DL'}));
    await waitFor(() => {
      expect(getRowTexts()[0]).toContain('192.168.1.100:51234');
      expect(getRowTexts()[1]).toContain('172.16.0.25:6881');
      expect(getRowTexts()[2]).toContain('10.0.0.50:49999');
    });

    // Click DL heading again -> toggle to ascending order
    await userEvent.click(canvas.getByRole('button', {name: 'DL'}));
    await waitFor(() => {
      expect(getRowTexts()[0]).toContain('10.0.0.50:49999');
      expect(getRowTexts()[1]).toContain('172.16.0.25:6881');
      expect(getRowTexts()[2]).toContain('192.168.1.100:51234');
    });

    // Click UL heading -> sort by uploadRate in descending order
    await userEvent.click(canvas.getByRole('button', {name: 'UL'}));
    await waitFor(() => {
      expect(getRowTexts()[0]).toContain('10.0.0.50:49999');
      expect(getRowTexts()[1]).toContain('192.168.1.100:51234');
      expect(getRowTexts()[2]).toContain('172.16.0.25:6881');
    });

    // Click % heading -> sort by completedPercent in descending order
    await userEvent.click(canvas.getByRole('button', {name: '%'}));
    await waitFor(() => {
      expect(getRowTexts()[0]).toContain('10.0.0.50:49999');
      expect(getRowTexts()[1]).toContain('172.16.0.25:6881');
      expect(getRowTexts()[2]).toContain('192.168.1.100:51234');
    });
  },
};
