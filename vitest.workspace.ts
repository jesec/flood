import {defineConfig, defineWorkspace} from 'vitest/config';

import {sharedConfig} from './vitest.config';

type ProjectOptions = {
  name: string;
  include?: string[];
  exclude?: string[];
  globalSetup?: string;
};

type TestConfig = {
  name?: string;
  include?: string[];
  exclude?: string[];
  globalSetup?: string;
  globals?: boolean;
  environment?: string;
};

const sharedTestConfig: TestConfig = {...(sharedConfig.test as TestConfig)};
const baseExclude = sharedTestConfig.exclude ?? [];

const createServerProject = (options: ProjectOptions) =>
  defineConfig({
    ...sharedConfig,
    test: {
      ...sharedTestConfig,
      name: options.name,
      include: options.include ?? ['server/**/*.test.ts'],
      exclude: [...baseExclude, ...(options.exclude ?? [])],
      globalSetup: options.globalSetup,
    },
  });

export default defineWorkspace([
  defineConfig({
    ...sharedConfig,
    test: {
      ...sharedTestConfig,
      name: 'client',
      include: ['client/**/*.test.ts', 'client/**/*.test.tsx'],
    },
  }),
  createServerProject({
    name: 'auth',
    include: ['server/routes/api/auth.test.ts'],
    globalSetup: 'server/.vitest/auth.setup.ts',
  }),
  createServerProject({
    name: 'rtorrent',
    exclude: ['server/routes/api/auth.test.ts'],
    globalSetup: 'server/.vitest/rtorrent.setup.ts',
  }),
  createServerProject({
    name: 'qbittorrent',
    exclude: ['server/routes/api/auth.test.ts'],
    globalSetup: 'server/.vitest/qbittorrent.setup.ts',
  }),
  createServerProject({
    name: 'transmission',
    exclude: ['server/routes/api/auth.test.ts'],
    globalSetup: 'server/.vitest/transmission.setup.ts',
  }),
]);
