'use strict';

const path = require('path');
const fs = require('fs');

const userConfig = require('../../config');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

function ensureSlash(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

module.exports = {
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('server/assets'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('client/src/javascript/app.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('client/src'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveApp('tests/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: userConfig.basePath,
  servedPath: ensureSlash(userConfig.basePath)
};
