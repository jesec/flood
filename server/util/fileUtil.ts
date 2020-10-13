import fs from 'fs';
import {homedir} from 'os';
import path from 'path';

import {TorrentContent, TorrentContentTree} from '@shared/types/TorrentContent';

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
  return config.allowedPaths.some((allowedPath) => {
    if (resolvedPath.startsWith(allowedPath)) {
      return true;
    }
    return false;
  });
};

export const sanitizePath = (input: string) => {
  if (typeof input !== 'string') {
    throw accessDeniedError();
  }

  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  return path.resolve(input).replace(controlRe, '');
};

export const createDirectory = (directoryPath: string) => {
  if (directoryPath) {
    fs.mkdir(directoryPath, {recursive: true}, (error) => {
      if (error) {
        console.trace('Error creating directory.', error);
      }
    });
  }
};

export const findFilesByIndices = (indices: Array<number>, fileTree: TorrentContentTree): TorrentContent[] => {
  const {directories, files = []} = fileTree;

  let selectedFiles = files.filter((file) => indices.includes(file.index));

  if (directories != null) {
    selectedFiles = selectedFiles.concat(
      Object.keys(directories).reduce(
        (accumulator: TorrentContent[], directory) =>
          accumulator.concat(findFilesByIndices(indices, directories[directory])),
        [],
      ),
    );
  }

  return selectedFiles;
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
