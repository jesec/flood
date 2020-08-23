const fs = require('fs');
const path = require('path');

const {tempPath} = require('../../config');

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

module.exports = new TemporaryStorage();
