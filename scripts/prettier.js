const fs = require('fs');
const prettier = require('prettier');

const readFile = (filePath) => {
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
    fs.writeFile(filePath, fileContent, (writeFileError) => {
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

module.exports = {
  formatFile,
};
