import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';

const checkRequiredFiles = (files) => {
  let currentFilePath;
  try {
    files.forEach((filePath) => {
      currentFilePath = filePath;
      fs.accessSync(filePath, fs.constants.F_OK);
    });
    return true;
  } catch {
    const dirName = path.dirname(currentFilePath);
    const fileName = path.basename(currentFilePath);
    console.log(chalk.red('Could not find a required file.'));
    console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
    console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
    return false;
  }
};

export default checkRequiredFiles;
