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

// Make sure any symlinks in the project folder are resolved:
const appDirectory = path.resolve(path.join(__dirname, '../../..'));
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const getAppDist = () => {
  // In production, assets are in assets/.
  let appDist = path.resolve(path.join(__dirname, 'assets'));

  if (!fs.existsSync(appDist)) {
    // In development, assets are in ${appDirectory}/dist/assets/.
    appDist = resolveApp('dist/assets');
  }

  if (!fs.existsSync(appDist)) {
    // Assets are placed to /usr when Flood is managed by package
    // managers other than npm. This allows users to serve static
    // assets from web server directly if they want.
    appDist = path.resolve('/usr/share/flood/assets');
  }

  return appDist;
};

export const createServerPaths = () => {
  return {
    appDist: getAppDist(),
  };
};
