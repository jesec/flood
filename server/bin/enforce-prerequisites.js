const fs = require('fs');
const glob = require('glob');
const path = require('path');

const {secret} = require('../../config');
const {appBuild} = require('../../shared/config/paths');

const staticAssets = [path.join(appBuild, 'index.html')];

const configFiles = [path.join(__dirname, '../../config.js')];

// Taken from react-scripts/check-required-files, but without console.logs.
const doFilesExist = (files) => {
  try {
    files.forEach((filename) => {
      fs.accessSync(filename, fs.F_OK);
    });
    return true;
  } catch (err) {
    return false;
  }
};

const grepRecursive = (folder, match) => {
  return glob.sync(folder.concat('/**/*')).some((file) => {
    try {
      if (!fs.lstatSync(file).isDirectory()) {
        return fs.readFileSync(file, {encoding: 'utf8'}).includes(match);
      }
      return false;
    } catch (error) {
      console.error(`Error reading file: ${file}\n${error}`);
      return false;
    }
  });
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

    // Ensures that server secret is not served to user
    if (grepRecursive(appBuild, secret)) {
      reject(new Error(`Secret is included in static assets. Please ensure that secret is unique.`));
      return;
    }

    return resolve();
  });

module.exports = enforcePrerequisites;
