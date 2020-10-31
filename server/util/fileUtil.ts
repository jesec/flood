import fs from 'fs';
import {homedir} from 'os';
import path from 'path';

import config from '../../config';

export const accessDeniedError = () => {
  const error = new Error() as NodeJS.ErrnoException;
  error.code = 'EACCES';
  return error;
};

export const fileNotFoundError = () => {
  const error = new Error() as NodeJS.ErrnoException;
  error.code = 'ENOENT';
  return error;
};

export const isAllowedPath = (resolvedPath: string) => {
  if (config.allowedPaths == null) {
    return true;
  }

  let realPath: string | null = null;
  let parentPath: string = resolvedPath;
  while (realPath == null) {
    try {
      realPath = fs.realpathSync(parentPath);
    } catch (e) {
      if (e.code === 'ENOENT') {
        parentPath = path.resolve(parentPath, '..');
      } else {
        return false;
      }
    }
  }

  return config.allowedPaths.some((allowedPath) => {
    if (realPath?.startsWith(allowedPath)) {
      return true;
    }
    return false;
  });
};

export const sanitizePath = (input: string): string => {
  if (typeof input !== 'string') {
    throw accessDeniedError();
  }

  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  return path.resolve(input).replace(controlRe, '');
};

export const createDirectory = (directoryPath: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (directoryPath) {
      fs.mkdir(directoryPath, {recursive: true}, (error) => {
        if (error) {
          console.trace('Error creating directory.', error);
          reject();
          return;
        }
        resolve();
      });
    } else {
      reject();
    }
  });
};

export const getDirectoryList = async (inputPath: string) => {
  if (typeof inputPath !== 'string') {
    throw fileNotFoundError();
  }

  const sourcePath = inputPath.replace(/^~/, homedir());

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
