// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
import fs from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;

const appDirectory = path.resolve(path.join(__dirname, '../..'));
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

export const appDistPath = getAppDist();
