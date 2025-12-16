import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDirectory = path.resolve(path.join(__dirname, '../..'));
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const getAppDist = () => {
  let appDist = path.resolve(path.join(__dirname, 'assets'));

  if (!fs.existsSync(appDist)) {
    appDist = resolveApp('dist/assets');
  }

  if (!fs.existsSync(appDist)) {
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

export const {appBuild, appDist, appPublic, appHtml, appIndex, appSrc, dist} = PATHS;

export default PATHS;
