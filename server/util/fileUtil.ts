import fs from 'fs';
import {homedir} from 'os';
import path from 'path';

import config from '../../config';

export const isAllowedPath = (resolvedPath: string) => {
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

export const sanitizePath = (input: string) => {
  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  return path.resolve(input).replace(controlRe, '');
};

export const accessDeniedError = () => {
  const error = new Error() as NodeJS.ErrnoException;
  error.code = 'EACCES';
  return error;
};

export const createDirectory = (options: {path: string}) => {
  if (options.path) {
    fs.mkdir(options.path, {recursive: true}, (error) => {
      if (error) {
        console.trace('Error creating directory.', error);
      }
    });
  }
};

export const getDirectoryList = async (inputPath: string) => {
  const sourcePath = (inputPath || '/').replace(/^~/, homedir());

  const resolvedPath = sanitizePath(sourcePath);
  if (!isAllowedPath(resolvedPath)) {
    throw accessDeniedError();
  }

  const directories: Array<string> = [];
  const files: Array<string> = [];

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

  return {
    directories,
    files,
    hasParent,
    path: resolvedPath,
    separator: path.sep,
  };
};
