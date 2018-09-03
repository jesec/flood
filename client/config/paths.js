const path = require('path');
const fs = require('fs');
const userConfig = require('../../config');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const ensureSlash = (path, needsSlash) => {
  const hasSlash = path.endsWith('/');
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
};

module.exports = {
  appBuild: resolveApp('server/assets'),
  appPublic: resolveApp('client/src/public/'),
  appHtml: resolveApp('client/src/index.html'),
  appIndexJs: resolveApp('client/src/javascript/app.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('./'),
  clientSrc: resolveApp('client/src'),
  testsSetup: resolveApp('tests/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  servedPath: ensureSlash(userConfig.baseURI || '/', true),
};
