import fs from 'node:fs';
import path from 'node:path';

import config from '../../config';

fs.mkdirSync(config.tempPath, {recursive: true});

export const getTempPath = (filename: string): string => {
  return path.join(config.tempPath, filename);
};

export const deleteFile = (filename: string): void => {
  fs.unlinkSync(getTempPath(filename));
};
