const fs = require('fs');
const path = require('path');
const userConfig = require('../../config');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = path.resolve(path.join(__dirname, '../..'));
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const ensureSlash = (questionablePath, needsSlash) => {
  const hasSlash = questionablePath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return questionablePath.substr(questionablePath, questionablePath.length - 1);
  }
  if (!hasSlash && needsSlash) {
    return `${questionablePath}/`;
  }
  return questionablePath;
};

const getAppDist = () => {
  // In production, assets are in assets/.
  const appDist = path.resolve(path.join(__dirname, 'assets'));
  if (!fs.existsSync(appDist)) {
    // In development, assets are in ${appDirectory}/dist/assets/.
    const appBuild = resolveApp('dist/assets');
    if (fs.existsSync(appBuild)) {
      return appBuild;
    }
  }
  return appDist;
};

module.exports = {
  appBuild: resolveApp('dist/assets'),
  appDist: getAppDist(),
  appPublic: resolveApp('client/src/public/'),
  appHtml: resolveApp('client/src/index.html'),
  appIndex: resolveApp('client/src/javascript/app.tsx'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('./'),
  clientSrc: resolveApp('client/src'),
  testsSetup: resolveApp('tests/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  servedPath: ensureSlash(userConfig.baseURI || '/', true),
};
