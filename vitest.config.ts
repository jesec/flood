import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export const sharedConfig = {
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node' as const,
  },
};

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    include: ['server/**/*.test.ts', 'client/**/*.test.ts'],
  },
});
