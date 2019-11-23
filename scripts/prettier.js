const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const prettier = require('prettier');

const SOURCE_PATTERN = `{client,scripts,server,shared}${path.sep}!(assets){${path.sep},}{**${
  path.sep
}*,*}.{js,jsx,ts,tsx,json,md}`;

const readFile = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, fileContent) => {
      if (error != null) {
        reject(error);
        return;
      }

      resolve(fileContent);
    });
  });
};

const writeFile = (filePath, fileContent) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileContent, writeFileError => {
      if (writeFileError) {
        reject(writeFileError);
        return;
      }

      resolve(filePath);
    });
  });
};

const formatFile = async (inputFilePath, outputFilePath) => {
  const fileContent = await readFile(inputFilePath);
  const prettierConfig = await prettier.resolveConfig(inputFilePath);
  const writtenFilePath = await writeFile(
    outputFilePath,
    prettier.format(fileContent, {...prettierConfig, filepath: inputFilePath}),
  );

  return writtenFilePath;
};

const getSourceFilePaths = () => {
  return new Promise((resolve, reject) => {
    glob(SOURCE_PATTERN, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(files.map(filePath => path.join(process.cwd(), filePath)));
    });
  });
};

const formatSource = async () => {
  console.log(chalk.reset('Formatting source files...'));

  try {
    const sourceFilePaths = await getSourceFilePaths();
    const formattedPaths = await Promise.all(sourceFilePaths.map(filePath => formatFile(filePath, filePath)));

    console.log(chalk.green(`Formatted ${formattedPaths.length} files.`));
  } catch (error) {
    console.log(chalk.red('Problem formatting file:\n'), chalk.reset(error));
    process.exit(1);
  }
};

const check = async () => {
  console.log(chalk.reset('Validating source file formatting...'));

  try {
    const sourceFilePaths = await getSourceFilePaths();
    await Promise.all(
      sourceFilePaths.map(async filePath => {
        const fileContent = await readFile(filePath);
        const prettierConfig = await prettier.resolveConfig(filePath);
        const isCompliant = prettier.check(fileContent, {...prettierConfig, filepath: filePath});

        if (!isCompliant) {
          throw filePath;
        }
      }),
    );

    console.log(chalk.green('Finished validating file formatting.'));
  } catch (error) {
    console.log(chalk.red('Unformatted file found:\n'), chalk.reset(error));
    process.exit(1);
  }
};

const commands = {check, formatSource};
const desiredCommand = process.argv.slice(2)[0];

if (commands[desiredCommand] != null) {
  commands[desiredCommand]();
}

module.exports = {
  formatFile,
};
