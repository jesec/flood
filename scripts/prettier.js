const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const prettier = require('prettier');

const filePattern = `{client,scripts,server,shared}${path.sep}!(assets){${path.sep},}{**${path.sep}*,*}.{js,json,md}`;

const iterateOverFiles = ({onFileRead}) =>
  new Promise((resolve, reject) => {
    glob(filePattern, (error, files) => {
      if (error) {
        reject(Error(error));
      }

      resolve(
        Promise.all(
          files.map(file => {
            const filePath = path.join(process.cwd(), file);
            const fileContents = fs.readFileSync(filePath, 'utf8');
            return onFileRead(filePath, fileContents);
          }),
        ),
      );
    });
  });

const format = () => {
  console.log(chalk.reset('Formatting files...'));

  iterateOverFiles({
    onFileRead: (filePath, fileContents) =>
      prettier.resolveConfig(filePath).then(
        options =>
          new Promise((resolve, reject) => {
            fs.writeFile(filePath, prettier.format(fileContents, {...options, filepath: filePath}), error => {
              if (error) {
                reject(error);
                return;
              }

              resolve();
            });
          }),
      ),
  })
    .then(() => {
      console.log(chalk.green('Done formatting files.'));
    })
    .catch(error => {
      console.log(chalk.red('Error formatting files:\n'), chalk.reset(error));
      process.exit(1);
    });
};

const check = () => {
  console.log(chalk.reset('Checking code formatting...'));

  iterateOverFiles({
    onFileRead: (filePath, fileContents) =>
      prettier.resolveConfig(filePath).then(options => {
        const isCompliant = prettier.check(fileContents, {...options, filepath: filePath});

        if (!isCompliant) {
          throw filePath;
        }
      }),
  })
    .then(() => {
      console.log(chalk.green('Done checking files.'));
    })
    .catch(error => {
      console.log(chalk.red('Unformatted file found:\n'), chalk.reset(error));
      process.exit(1);
    });
};

const commands = {check, format};
const desiredCommand = process.argv.slice(2)[0];

if (commands[desiredCommand] == null) {
  throw new Error(`No command ${desiredCommand}.`);
} else {
  commands[desiredCommand]();
}
