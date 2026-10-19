import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {lingui} from '@lingui/vite-plugin';
import type {StorybookConfig} from '@storybook/react-vite';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

// Mock action modules that should be replaced in Storybook
const MOCKED_ACTION_MODULES = [
  'FloodActions',
  'TorrentActions',
  'SettingActions',
  'AuthActions',
  'ClientActions',
  'FeedActions',
] as const;

const mockDir = path.resolve(storybookDir, './mocks');
const realActionsDir = path.resolve(storybookDir, '../client/src/javascript/actions');

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
      plugins: [
        lingui(),
        {
          name: 'storybook-mock-action-modules',
          enforce: 'pre',
          resolveId(id: string, _importer: string | undefined) {
            // Intercept @client/actions/* imports.
            // vite-tsconfig-paths (from the Storybook framework) runs earlier
            // and resolves @client aliases to absolute paths, so our hook
            // must match both the alias form AND already-resolved paths.
            const cleanId = id.split('?')[0];
            for (const moduleName of MOCKED_ACTION_MODULES) {
              const aliasPath = `@client/actions/${moduleName}`;
              const realPath = path.resolve(realActionsDir, `${moduleName}.ts`);
              const realPathNoExt = realPath.replace(/\.ts$/, '');

              if (cleanId === aliasPath || cleanId === realPath || cleanId === realPathNoExt) {
                return path.resolve(mockDir, `${moduleName}.ts`);
              }
            }
            return undefined;
          },
        },
      ],
      resolve: {
        alias: [
          // Action module mocks — must come before the general @client alias
          {find: '@client/actions/FloodActions', replacement: path.resolve(mockDir, 'FloodActions.ts')},
          {find: '@client/actions/TorrentActions', replacement: path.resolve(mockDir, 'TorrentActions.ts')},
          {find: '@client/actions/SettingActions', replacement: path.resolve(mockDir, 'SettingActions.ts')},
          {find: '@client/actions/AuthActions', replacement: path.resolve(mockDir, 'AuthActions.ts')},
          {find: '@client/actions/ClientActions', replacement: path.resolve(mockDir, 'ClientActions.ts')},
          {find: '@client/actions/FeedActions', replacement: path.resolve(mockDir, 'FeedActions.ts')},
          // General aliases
          {find: '@client/storybook-mocks', replacement: path.resolve(mockDir)},
          {find: '@client', replacement: path.resolve(storybookDir, '../client/src/javascript')},
          {find: '@shared', replacement: path.resolve(storybookDir, '../shared')},
        ],
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
