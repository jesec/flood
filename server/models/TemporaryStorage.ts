import fs from 'fs';
import path from 'path';

import {tempPath} from '../../config';

fs.mkdirSync(tempPath, {recursive: true});

export const getTempPath = (filename: string): string => {
  return path.join(tempPath, filename);
};

export const deleteFile = (filename: string): void => {
  fs.unlinkSync(getTempPath(filename));
};
