import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import LoadingOverlay from './LoadingOverlay';

const meta = {
  title: 'Components/General/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['loading-recovery'],
  parameters: {layout: 'fullscreen'},
  args: {
    dependencies: {
      notifications: {id: 'notifications', message: {id: 'dependency.loading.notifications'}, satisfied: true},
      'torrent-taxonomy': {
        id: 'torrent-taxonomy',
        message: {id: 'dependency.loading.torrent.taxonomy'},
        satisfied: true,
      },
      'transfer-data': {
        id: 'transfer-data',
        message: {id: 'dependency.loading.transfer.rate.details'},
        satisfied: true,
      },
      'transfer-history': {
        id: 'transfer-history',
        message: {id: 'dependency.loading.transfer.history'},
        satisfied: false,
      },
      'torrent-list': {id: 'torrent-list', message: {id: 'dependency.loading.torrent.list'}, satisfied: false},
    },
  },
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthenticatedWhileHistoryPending: Story = {
  args: {onLogout: fn()},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Data Transfer History')).toBeVisible();
    const logout = canvas.getByRole('button', {name: 'Log Out'});
    await expect(logout).toBeVisible();
    await userEvent.tab();
    await expect(logout).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onLogout).toHaveBeenCalledTimes(1);
  },
};

export const WithoutLogoutAction: Story = {
  render: (args) => <LoadingOverlay {...args} onLogout={undefined} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Data Transfer History')).toBeVisible();
    await expect(canvas.queryByRole('button', {name: 'Log Out'})).not.toBeInTheDocument();
  },
};
