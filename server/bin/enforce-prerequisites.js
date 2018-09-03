'use strict';
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const fs = require('fs');
const path = require('path');

const staticAssets = [path.join(__dirname, '../assets/index.html')];

const configFiles = [path.join(__dirname, '../../config.js')];

// Taken from react-scripts/check-required-files, but without console.logs.
const doFilesExist = files => {
  let currentFilePath;
  try {
    files.forEach(filename => {
      currentFilePath = filename;
      fs.accessSync(filename, fs.F_OK);
    });
    return true;
  } catch (err) {
    return false;
  }
};

const enforcePrerequisites = () => {
  return new Promise((resolve, reject) => {
    if (!doFilesExist(configFiles)) {
      reject(`Configuration files missing. Please check the 'Configuring' section of README.md.`);
      return;
    }

    if (!doFilesExist(staticAssets)) {
      reject(
        `Static assets (index.html) are missing. Please check the 'Compiling assets and starting the server' section of README.md.`
      );
      return;
    }

    return resolve();
  });
};

module.exports = enforcePrerequisites;
