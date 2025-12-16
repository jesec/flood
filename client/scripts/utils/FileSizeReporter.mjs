/**
 * Based on react-dev-utils FileSizeReporter
 * Provides file size reporting for build output
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import chalk from 'chalk';

const formatFileSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

const gzipSize = (contents) => zlib.gzipSync(contents).length;

const stripAnsi = (str) => str.replace(/\u001b\[[0-9;]*m/g, '');

const recursiveReadDir = (dir, fileList = []) => {
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
};

const canReadAsset = (asset) =>
  /\.(js|css)$/.test(asset) && !/service-worker\.js/.test(asset) && !/precache-manifest\.[0-9a-f]+\.js/.test(asset);

const printFileSizesAfterBuild = (webpackStats, previousSizeMap, buildFolder, maxBundleGzipSize, maxChunkGzipSize) => {
  const {root, sizes} = previousSizeMap;
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
            size,
            sizeLabel: `${formatFileSize(size)}${difference ? ` (${difference})` : ''}`,
          };
        }),
    )
    .reduce((single, all) => all.concat(single), []);

  assets.sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max(...assets.map((a) => stripAnsi(a.sizeLabel).length));
  let suggestBundleSplitting = false;
  assets.forEach((asset) => {
    let {sizeLabel} = asset;
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
      `  ${isLarge ? chalk.yellow(sizeLabel) : sizeLabel}  ${chalk.dim(`${asset.folder}${path.sep}`)}${chalk.cyan(
        asset.name,
      )}`,
    );
  });
  if (suggestBundleSplitting) {
    console.log();
    console.log(chalk.yellow('The bundle size is significantly larger than recommended.'));
    console.log(chalk.yellow('Consider reducing it with code splitting: https://goo.gl/9VhYWB'));
    console.log(chalk.yellow('You can also analyze the project dependencies: https://goo.gl/LeUzfb'));
  }
};

const removeFileNameHash = (buildFolder, fileName) =>
  fileName
    .replace(buildFolder, '')
    .replace(/\\/g, '/')
    .replace(/\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/, (_match, p1, _p2, _p3, p4) => p1 + p4);

const getDifferenceLabel = (currentSize, previousSize) => {
  const FIFTY_KILOBYTES = 1024 * 50;
  const difference = currentSize - previousSize;
  const fileSize = !Number.isNaN(difference) ? formatFileSize(Math.abs(difference)) : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red(`+${fileSize}`);
  }
  if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow(`+${fileSize}`);
  }
  if (difference < 0) {
    return chalk.green(`-${fileSize}`);
  }
  return '';
};

const measureFileSizesBeforeBuild = (buildFolder) =>
  new Promise((resolve) => {
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
        sizes,
      });
    } catch {
      resolve({
        root: buildFolder,
        sizes: {},
      });
    }
  });

export {measureFileSizesBeforeBuild, printFileSizesAfterBuild};
