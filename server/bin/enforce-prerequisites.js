const fs = require('fs');
const path = require('path');

const staticAssets = [path.join(__dirname, '../assets/index.html')];

const configFiles = [path.join(__dirname, '../../config.js')];

// Taken from react-scripts/check-required-files, but without console.logs.
const doFilesExist = files => {
  try {
    files.forEach(filename => {
      fs.accessSync(filename, fs.F_OK);
    });
    return true;
  } catch (err) {
    return false;
  }
};

const enforcePrerequisites = () =>
  new Promise((resolve, reject) => {
    if (!doFilesExist(configFiles)) {
      reject(new Error(`Configuration files missing. Please check the 'Configuring' section of README.md.`));
      return;
    }

    if (!doFilesExist(staticAssets)) {
      reject(
        new Error(
          `Static assets (index.html) are missing. Please check the 'Compiling assets and starting the server' section of README.md.`,
        ),
      );
      return;
    }

    return resolve();
  });

module.exports = enforcePrerequisites;
