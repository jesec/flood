import fs from 'fs';
import path from 'path';

import {tempPath} from '../../config';

class TemporaryStorage {
  constructor() {
    fs.mkdir(tempPath, {recursive: true});
  }

  deleteFile(filename) {
    fs.unlink(this.getTempPath(filename));
  }

  getTempPath(filename) {
    return path.join(tempPath, filename);
  }
}

export default new TemporaryStorage();
