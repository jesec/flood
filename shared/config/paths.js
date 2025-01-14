const fs = require('node:fs');
const path = require('node:path');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
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

module.exports = PATHS;
