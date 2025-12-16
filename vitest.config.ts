import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';
import type {UserConfig} from 'vitest/config';

const sharedPlugins = [tsconfigPaths()] as NonNullable<UserConfig['plugins']>;

export const sharedConfig: UserConfig = {
  plugins: sharedPlugins,
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
