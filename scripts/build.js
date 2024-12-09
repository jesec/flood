// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

const path = require('node:path');
const esbuild = require('esbuild');
const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const paths = require('../shared/config/paths');
const clientConfig = require('../client/config/webpack.config.prod');

const {measureFileSizesBeforeBuild, printFileSizesAfterBuild} = FileSizeReporter;

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndex])) {
  process.exit(1);
}

const copyPublicFolder = () => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  });
};

// Create the production build and print the deployment instructions.
const build = async (previousFileSizes) => {
  console.log('Creating an optimized production build...');
  console.log('building server...');

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '..', 'server/bin/start.ts')],
    outfile: path.resolve(__dirname, '..', 'dist/index.js'),
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

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild)
  .then((previousFileSizes) => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.dist);
    // Merge with the public folder
    copyPublicFolder();
    // Start the webpack build
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
