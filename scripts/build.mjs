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

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

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

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=UTF-8';
    case '.js':
      return 'text/javascript; charset=UTF-8';
    case '.css':
      return 'text/css; charset=UTF-8';
    case '.json':
      return 'application/json; charset=UTF-8';
    case '.map':
      return 'application/json; charset=UTF-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.ico':
      return 'image/x-icon';
    case '.woff2':
      return 'font/woff2';
    case '.txt':
      return 'text/plain; charset=UTF-8';
    default:
      return 'application/octet-stream';
  }
};

const collectEmbeddedAssets = (assetsRoot) => {
  /** @type {{[assetPath: string]: {type: string; bodyBase64: string}}} */
  const embedded = {};

  /** @type {string[]} */
  const dirs = [''];

  while (dirs.length > 0) {
    const relativeDir = dirs.pop();
    const absoluteDir = path.join(assetsRoot, relativeDir);

    const entries = fs.readdirSync(absoluteDir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const relativePath = path.join(relativeDir, entry.name);
      const absolutePath = path.join(assetsRoot, relativePath);

      if (entry.isDirectory()) {
        dirs.push(relativePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const assetKey = relativePath.replace(/\\/g, '/');
      const body = fs.readFileSync(absolutePath);
      embedded[assetKey] = {
        type: getContentType(assetKey),
        bodyBase64: body.toString('base64'),
      };
    }
  }

  return embedded;
};

// Create the production build and print the deployment instructions.
const build = async (previousFileSizes) => {
  console.log('Creating an optimized production build...');
  console.log('building client...');

  const compiler = webpack([clientConfig]);
  const {stats} = await new Promise((resolve, reject) => {
    compiler.run((err, buildStats) => {
      if (err) {
        return reject(err);
      }

      return resolve({
        stats: buildStats,
      });
    });
  });

  if (stats.hasErrors()) {
    return {
      stats,
      previousFileSizes,
    };
  }

  const embeddedAssets = collectEmbeddedAssets(paths.appBuild);

  console.log('building server (embedding ui assets)...');

  await esbuild.build({
    entryPoints: [path.resolve(buildPaths.appSrc, 'server/bin/start.ts')],
    outfile: path.resolve(buildPaths.appSrc, 'dist/index.js'),
    platform: 'node',
    target: 'node12',
    bundle: true,
    external: ['geoip-country'],
    sourcemap: 'inline',
    define: {
      __FLOOD_EMBEDDED_ASSETS__: JSON.stringify(embeddedAssets),
    },
  });

  return {
    stats,
    previousFileSizes,
  };
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
