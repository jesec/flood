import {defineConfig, type UserConfig, type UserConfigExport} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

type VitestPlugin = NonNullable<UserConfig['plugins']>[number];

const tsconfigPathsPlugin = tsconfigPaths() as VitestPlugin;

export const sharedConfig: UserConfigExport = {
  plugins: [tsconfigPathsPlugin],
  test: {
    globals: true,
    environment: 'node',
  },
};

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    include: ['server/**/*.test.ts', 'client/**/*.test.ts'],
  },
});
