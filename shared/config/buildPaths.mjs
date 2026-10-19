import path from 'node:path';
import url from 'node:url';

const appDirectory = path.resolve(url.fileURLToPath(import.meta.url), '../../..');
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export const buildPaths = {
  appBuild: resolveApp('dist/assets'),
  appPublic: resolveApp('client/src/public/'),
  appHtml: resolveApp('client/src/index.html'),
  appIndex: resolveApp('client/src/javascript/app.tsx'),
  appSrc: resolveApp('./'),
  dist: resolveApp('dist'),
};
