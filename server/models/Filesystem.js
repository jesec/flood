let fs = require('fs');
let ospath = require('ospath');
let path = require('path');

class Filesystem {
  getDirectoryList(options, callback) {
    let sourcePath = (options.path || '/').replace(/^~/, ospath.home());

    try {
      let directories = [];
      let files = [];

      fs.readdirSync(sourcePath).forEach(item => {
        if (fs.statSync(path.join(sourcePath, item)).isDirectory()) {
          directories.push(item);
        } else {
          files.push(item);
        }
      });

      let hasParent = /^.{0,}:?(\/|\\){1,1}\S{1,}/.test(sourcePath);

      callback({
        directories,
        files,
        hasParent,
        path: sourcePath,
        separator: path.sep,
      });
    } catch (error) {
      callback(null, error);
    }
  }
}

module.exports = new Filesystem();
