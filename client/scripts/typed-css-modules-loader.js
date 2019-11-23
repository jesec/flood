const chalk = require('chalk');
const DtsCreator = require('typed-css-modules');
const prettier = require('../../scripts/prettier');

const creator = new DtsCreator();

module.exports = async function moduleLoader(source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  try {
    const callback = this.async();
    const dtsContent = await creator.create(this.resourcePath, source);

    await dtsContent.writeFile();
    await prettier.formatFile(dtsContent.outputFilePath, dtsContent.outputFilePath);

    return callback(null, source, map);
  } catch (error) {
    console.log(chalk.red(chalk.red('CSS module type generation failed.')));
    console.log(error.message);

    if (error.stack != null) {
      console.log(chalk.gray(error.stack));
    }
  }
};
