import {defineConfig, defineProject, type ViteUserConfig} from 'vitest/config';
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
  hookTimeout: 60000,
  fileParallelism: false,
};

export default defineConfig({
  plugins: [tsconfigPathsPlugin],
  test: {
    globals: true,
    environment: 'node',
    projects: [
      defineProject({
        plugins: [tsconfigPathsPlugin],
        test: {
          ...baseTestConfig,
          name: 'auth',
          setupFiles: ['server/.jest/auth.setup.js'],
          include: ['server/routes/api/auth.test.ts'],
        },
      }),
      defineProject({
        plugins: [tsconfigPathsPlugin],
        test: {
          ...baseTestConfig,
          name: 'qbittorrent',
          setupFiles: ['server/.jest/qbittorrent.setup.js'],
          include: ['server/**/*.test.ts'],
          exclude: ['server/routes/api/auth.test.ts'],
        },
      }),
      defineProject({
        plugins: [tsconfigPathsPlugin],
        test: {
          ...baseTestConfig,
          name: 'rtorrent',
          setupFiles: ['server/.jest/rtorrent.setup.js'],
          include: ['server/**/*.test.ts'],
          exclude: ['server/routes/api/auth.test.ts'],
        },
      }),
      defineProject({
        plugins: [tsconfigPathsPlugin],
        test: {
          ...baseTestConfig,
          name: 'transmission',
          setupFiles: ['server/.jest/transmission.setup.js'],
          include: ['server/**/*.test.ts'],
          exclude: ['server/routes/api/auth.test.ts'],
        },
      }),
    ],
  },
});
