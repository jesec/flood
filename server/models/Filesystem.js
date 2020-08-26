const fs = require('fs');
const os = require('os');
const path = require('path');

const fileUtil = require('../util/fileUtil');

const getDirectoryList = (options, callback) => {
  const sourcePath = (options.path || '/').replace(/^~/, os.homedir());

  const resolvedPath = path.resolve(sourcePath);
  if (!fileUtil.isAllowedPath(resolvedPath)) {
    callback(null, fileUtil.accessDeniedError());
    return;
  }

  try {
    const directories = [];
    const files = [];

    fs.readdirSync(resolvedPath).forEach((item) => {
      const joinedPath = path.join(resolvedPath, item);
      if (fs.existsSync(joinedPath)) {
        if (fs.statSync(joinedPath).isDirectory()) {
          directories.push(item);
        } else {
          files.push(item);
        }
      }
    });

    const hasParent = /^.{0,}:?(\/|\\){1,1}\S{1,}/.test(resolvedPath);

    callback({
      directories,
      files,
      hasParent,
      path: resolvedPath,
      separator: path.sep,
    });
  } catch (error) {
    callback(null, error);
  }
};

module.exports = {getDirectoryList};
