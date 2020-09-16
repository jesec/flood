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

const getAppBuild = () => {
  let appBuild = resolveApp('dist/assets');
  if (!fs.existsSync(appBuild)) {
    // In production, appDirectory is dist/.
    const appDist = resolveApp('assets');
    if (fs.existsSync(appDist)) {
      appBuild = appDist;
    }
  }
  return appBuild;
};

module.exports = {
  appBuild: getAppBuild(),
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
