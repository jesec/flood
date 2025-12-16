import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const findProjectRoot = (startDir: string) => {
  let current = startDir;

  while (true) {
    const packageJson = path.join(current, 'package.json');
    if (fs.existsSync(packageJson)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }

    current = parent;
  }
};

const defaultBaseDir = findProjectRoot(path.dirname(process.argv[1]));

const createBaseResolvers = (baseDir = defaultBaseDir) => {
  const appDirectory = path.resolve(baseDir);
  const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

  return {appDirectory, resolveApp};
};

export const createServerPaths = (baseDir = defaultBaseDir) => {
  const {appDirectory, resolveApp} = createBaseResolvers(baseDir);

  const getAppDist = () => {
    const localAssets = path.resolve(appDirectory, 'shared/config/assets');
    if (fs.existsSync(localAssets)) {
      return localAssets;
    }

    const buildAssets = resolveApp('dist/assets');
    if (fs.existsSync(buildAssets)) {
      return buildAssets;
    }

    return path.resolve('/usr/share/flood/assets');
  };

  return {
    appDist: getAppDist(),
  };
};
