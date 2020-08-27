const fs = require('fs');
const path = require('path');

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

const sanitizePath = (input) => {
  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  return path.resolve(input).replace(controlRe, '');
};

const accessDeniedError = () => {
  const error = new Error();
  error.code = 'EACCES';
  return error;
};

const fileUtil = {
  createDirectory,
  isAllowedPath,
  sanitizePath,
  accessDeniedError,
};

module.exports = fileUtil;
