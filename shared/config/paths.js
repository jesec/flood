import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Make sure any symlinks in the project folder are resolved:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDirectory = path.resolve(path.join(__dirname, '../..'));
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

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

const PATHS = {
  appBuild: resolveApp('dist/assets'),
  appDist: getAppDist(),
  appPublic: resolveApp('client/src/public/'),
  appHtml: resolveApp('client/src/index.html'),
  appIndex: resolveApp('client/src/javascript/app.tsx'),
  appSrc: resolveApp('./'),
  dist: resolveApp('dist'),
};

export default PATHS;
