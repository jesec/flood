import path from 'node:path';

import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import {buildPaths} from './shared/config/buildPaths.mjs';

export default defineConfig(({command}) => {
  if (command === 'serve') {
    return {
      plugins: [tsconfigPaths()],
    };
  }

  return {
    ssr: {
      noExternal: true,
    },
    build: {
      emptyOutDir: false,
      minify: false,
      outDir: path.resolve(buildPaths.appSrc, 'dist'),
      rolldownOptions: {
        external: ['geoip-country'],
        output: {
          codeSplitting: false,
          entryFileNames: 'index.js',
          format: 'cjs',
        },
      },
      sourcemap: 'inline',
      ssr: path.resolve(buildPaths.appSrc, 'server/bin/start.ts'),
      target: 'node12',
    },
  };
});
