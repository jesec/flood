import {defineConfig} from 'vitest/config';

/**
 * Opt-in integration suite for the rstorrent connector.
 *
 * Requires a real rstorrent binary with gRPC support (crates/rt-grpc):
 *   RSTORRENT_BIN=/path/to/rstorrent pnpm run test:rstorrent
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    globalSetup: 'server/.jest/globalSetup.js',
    testTimeout: 60000,
    hookTimeout: 60000,
    setupFiles: ['server/.jest/rstorrent.setup.js'],
    include: [
      'server/routes/api/torrents.test.ts',
      'server/routes/api/client.test.ts',
      'server/services/rstorrent/**/*.integration.test.ts',
    ],
  },
});
