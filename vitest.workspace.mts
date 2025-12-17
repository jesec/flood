import {defineConfig, defineWorkspace, type ViteUserConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

type VitestPlugin = NonNullable<ViteUserConfig['plugins']>[number];

const tsconfigPathsPlugin = tsconfigPaths() as VitestPlugin;

const baseTestConfig = {
  environment: 'node' as const,
  coverage: {
    enabled: true,
    provider: 'v8' as const,
    reporter: ['text', 'lcov', 'clover'],
    reportsDirectory: 'coverage',
    clean: false,
  },
  testTimeout: 60000,
  poolOptions: {
    threads: {
      singleThread: true,
    },
  },
};

const createProject = (name: string, setupFile: string, include: string[], exclude: string[] = []) =>
  defineConfig({
    plugins: [tsconfigPathsPlugin],
    test: {
      ...baseTestConfig,
      name,
      include,
      exclude,
      setupFiles: [setupFile],
    },
  });

export default defineWorkspace([
  createProject('client', 'client/.jest/setup.js', ['client/**/*.test.ts']),
  createProject('auth', 'server/.jest/auth.setup.js', ['server/routes/api/auth.test.ts']),
  createProject(
    'qbittorrent',
    'server/.jest/qbittorrent.setup.js',
    ['server/**/*.test.ts'],
    ['server/routes/api/auth.test.ts'],
  ),
  createProject(
    'rtorrent',
    'server/.jest/rtorrent.setup.js',
    ['server/**/*.test.ts'],
    ['server/routes/api/auth.test.ts'],
  ),
  createProject(
    'transmission',
    'server/.jest/transmission.setup.js',
    ['server/**/*.test.ts'],
    ['server/routes/api/auth.test.ts'],
  ),
]);
