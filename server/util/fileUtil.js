const fs = require('fs');

const config = require('../../config');

const createDirectory = (options) => {
  if (options.path) {
    fs.mkdir(options.path, {recursive: true}, (error) => {
      if (error) {
        console.trace('Error creating directory.', error);
      }
    });
  }
};

const isAllowedPath = (resolvedPath) => {
  if (config.allowedPaths == null) {
    return true;
  }
  return config.allowedPaths.some((allowedPath) => {
    if (resolvedPath.startsWith(allowedPath)) {
      return true;
    }
    return false;
  });
};

const accessDeniedError = () => {
  const error = new Error();
  error.code = 'EACCES';
  return error;
};

const fileUtil = {
  createDirectory,
  isAllowedPath,
  accessDeniedError,
};

module.exports = fileUtil;
