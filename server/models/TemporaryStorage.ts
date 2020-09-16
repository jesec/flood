import fs from 'fs';
import path from 'path';

import {tempPath} from '../../config';

class TemporaryStorage {
  constructor() {
    fs.mkdirSync(tempPath, {recursive: true});
  }

  deleteFile(filename: string): void {
    fs.unlinkSync(this.getTempPath(filename));
  }

  getTempPath(filename: string): string {
    return path.join(tempPath, filename);
  }
}

export default new TemporaryStorage();
