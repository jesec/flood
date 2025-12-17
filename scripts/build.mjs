import path from 'node:path';

import chalk from 'chalk';
import esbuild from 'esbuild';
import fs from 'fs-extra';
import webpack from 'webpack';

import clientConfig from '../client/config/webpack.config.prod.mjs';
import checkRequiredFiles from '../client/scripts/utils/checkRequiredFiles.mjs';
import {measureFileSizesBeforeBuild, printFileSizesAfterBuild} from '../client/scripts/utils/FileSizeReporter.mjs';
import {buildPaths} from '../shared/config/buildPaths.mjs';

const paths = buildPaths;

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

process.on('unhandledRejection', (err) => {
  throw err;
});

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

if (!checkRequiredFiles([paths.appHtml, paths.appIndex])) {
  process.exit(1);
}

const copyPublicFolder = () => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  });
};

const build = async (previousFileSizes) => {
  console.log('Creating an optimized production build...');
  console.log('building server...');

  await esbuild.build({
    entryPoints: [path.resolve('server/bin/start.ts')],
    outfile: path.resolve('dist/index.js'),
    platform: 'node',
    target: 'node12',
    bundle: true,
    external: ['geoip-country'],
    sourcemap: 'inline',
  });

  console.log('building client...');

  const compiler = webpack([clientConfig]);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve({
        stats,
        previousFileSizes,
      });
    });
  });
};

measureFileSizesBeforeBuild(paths.appBuild)
  .then((previousFileSizes) => {
    fs.emptyDirSync(paths.dist);
    copyPublicFolder();
    return build(previousFileSizes);
  })
  .then(
    ({stats, previousFileSizes}) => {
      console.log(
        stats.toString({
          chunks: false,
          colors: true,
        }),
      );

      if (stats.hasErrors()) {
        process.exit(1);
      }

      console.log('\nClient file sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats.stats[0],
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE,
      );
    },
    (err) => {
      console.log(chalk.red('Failed to compile.\n'));
      console.log(`${err.message || err}\n`);
      process.exit(1);
    },
  );
