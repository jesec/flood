/**
 * Based on react-dev-utils FileSizeReporter
 * Provides file size reporting for build output
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const chalk = require('chalk');

// Simple filesize formatter
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return size.toFixed(unitIndex === 0 ? 0 : 2) + ' ' + units[unitIndex];
}

// Calculate gzip size
function gzipSize(contents) {
  return zlib.gzipSync(contents).length;
}

// Strip ANSI color codes
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

// Recursively read directory
function recursiveReadDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      recursiveReadDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function canReadAsset(asset) {
  return (
    /\.(js|css)$/.test(asset) && !/service-worker\.js/.test(asset) && !/precache-manifest\.[0-9a-f]+\.js/.test(asset)
  );
}

// Prints a detailed summary of build files.
function printFileSizesAfterBuild(webpackStats, previousSizeMap, buildFolder, maxBundleGzipSize, maxChunkGzipSize) {
  const root = previousSizeMap.root;
  const sizes = previousSizeMap.sizes;
  const assets = (webpackStats.stats || [webpackStats])
    .map((stats) =>
      stats
        .toJson({all: false, assets: true})
        .assets.filter((asset) => canReadAsset(asset.name))
        .map((asset) => {
          const fileContents = fs.readFileSync(path.join(root, asset.name));
          const size = gzipSize(fileContents);
          const previousSize = sizes[removeFileNameHash(root, asset.name)];
          const difference = getDifferenceLabel(size, previousSize);
          return {
            folder: path.join(path.basename(buildFolder), path.dirname(asset.name)),
            name: path.basename(asset.name),
            size: size,
            sizeLabel: formatFileSize(size) + (difference ? ' (' + difference + ')' : ''),
          };
        }),
    )
    .reduce((single, all) => all.concat(single), []);
  assets.sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max.apply(
    null,
    assets.map((a) => stripAnsi(a.sizeLabel).length),
  );
  let suggestBundleSplitting = false;
  assets.forEach((asset) => {
    let sizeLabel = asset.sizeLabel;
    const sizeLength = stripAnsi(sizeLabel).length;
    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
      sizeLabel += rightPadding;
    }
    const isMainBundle = asset.name.indexOf('main.') === 0;
    const maxRecommendedSize = isMainBundle ? maxBundleGzipSize : maxChunkGzipSize;
    const isLarge = maxRecommendedSize && asset.size > maxRecommendedSize;
    if (isLarge && path.extname(asset.name) === '.js') {
      suggestBundleSplitting = true;
    }
    console.log(
      '  ' +
        (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) +
        '  ' +
        chalk.dim(asset.folder + path.sep) +
        chalk.cyan(asset.name),
    );
  });
  if (suggestBundleSplitting) {
    console.log();
    console.log(chalk.yellow('The bundle size is significantly larger than recommended.'));
    console.log(chalk.yellow('Consider reducing it with code splitting: https://goo.gl/9VhYWB'));
    console.log(chalk.yellow('You can also analyze the project dependencies: https://goo.gl/LeUzfb'));
  }
}

function removeFileNameHash(buildFolder, fileName) {
  return fileName
    .replace(buildFolder, '')
    .replace(/\\/g, '/')
    .replace(/\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/, (match, p1, p2, p3, p4) => p1 + p4);
}

// Input: 1024, 2048
// Output: "(+1 KB)"
function getDifferenceLabel(currentSize, previousSize) {
  const FIFTY_KILOBYTES = 1024 * 50;
  const difference = currentSize - previousSize;
  const fileSize = !Number.isNaN(difference) ? formatFileSize(Math.abs(difference)) : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow('+' + fileSize);
  } else if (difference < 0) {
    return chalk.green('-' + fileSize);
  } else {
    return '';
  }
}

function measureFileSizesBeforeBuild(buildFolder) {
  return new Promise((resolve) => {
    try {
      const fileNames = recursiveReadDir(buildFolder);
      const sizes = fileNames.filter(canReadAsset).reduce((memo, fileName) => {
        const contents = fs.readFileSync(fileName);
        const key = removeFileNameHash(buildFolder, fileName);
        memo[key] = gzipSize(contents);
        return memo;
      }, {});

      resolve({
        root: buildFolder,
        sizes: sizes,
      });
    } catch {
      // If directory doesn't exist or error reading, return empty sizes
      resolve({
        root: buildFolder,
        sizes: {},
      });
    }
  });
}

module.exports = {
  measureFileSizesBeforeBuild: measureFileSizesBeforeBuild,
  printFileSizesAfterBuild: printFileSizesAfterBuild,
};
