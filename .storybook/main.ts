import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {lingui} from '@lingui/vite-plugin';
import type {StorybookConfig} from '@storybook/react-vite';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../client/src/javascript/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-onboarding'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const {mergeConfig} = await import('vite');

    return mergeConfig(config, {
      plugins: [lingui()],
      resolve: {
        alias: {
          '@client': path.resolve(storybookDir, '../client/src/javascript'),
          '@shared': path.resolve(storybookDir, '../shared'),
          // Mock action modules
          '@client/actions/FloodActions': path.resolve(storybookDir, './mocks/FloodActions.ts'),
          '@client/actions/TorrentActions': path.resolve(storybookDir, './mocks/TorrentActions.ts'),
          '@client/actions/SettingActions': path.resolve(storybookDir, './mocks/SettingActions.ts'),
          '@client/actions/AuthActions': path.resolve(storybookDir, './mocks/AuthActions.ts'),
          '@client/actions/ClientActions': path.resolve(storybookDir, './mocks/ClientActions.ts'),
          '@client/actions/FeedActions': path.resolve(storybookDir, './mocks/FeedActions.ts'),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ['mixed-decls'],
          },
        },
      },
    });
  },
};

export default config;
