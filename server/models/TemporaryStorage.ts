import fs from 'fs';
import path from 'path';

import {tempPath} from '../../config';

class TemporaryStorage {
  constructor() {
    fs.mkdirSync(tempPath, {recursive: true});
  }

  static deleteFile(filename: string): void {
    fs.unlinkSync(TemporaryStorage.getTempPath(filename));
  }

  static getTempPath(filename: string): string {
    return path.join(tempPath, filename);
  }
}

export default new TemporaryStorage();
