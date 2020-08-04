const fs = require('fs');
const path = require('path');

class TemporaryStorage {
  constructor() {
    this.tempPath = path.join(path.dirname(require.main.filename), '..', 'temp');

    fs.mkdir(this.tempPath, {recursive: true});
  }

  deleteFile(filename) {
    fs.unlink(this.getTempPath(filename));
  }

  getTempPath(filename) {
    return path.join(this.tempPath, filename);
  }
}

module.exports = new TemporaryStorage();
