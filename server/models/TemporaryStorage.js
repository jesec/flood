const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

class TemporaryStorage {
  constructor() {
    this.tempPath = path.join(path.dirname(require.main.filename), '..', 'temp');

    mkdirp(this.tempPath);
  }

  deleteFile(filename) {
    fs.unlink(this.getTempPath(filename));
  }

  getTempPath(filename) {
    return path.join(this.tempPath, filename);
  }
}

module.exports = new TemporaryStorage();
