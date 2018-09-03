const chalk = require('chalk');

const messageDefs = [
  {
    chalkStyles: ['black'],
    message: 'This npm script has been deprecated!',
  },
  {
    chalkStyles: ['underline', 'black'],
    message: `Use npm script \`${process.env.UPDATED_SCRIPT}\` instead.`,
  },
];
const longestMessageLength = messageDefs.reduce((accumulator, messageDef) => {
  if (messageDef.message.length > accumulator) {
    accumulator = messageDef.message.length;
  }

  return accumulator;
}, 0);
const paddingLength = 5;
const verticalPadding = paddingLength * 2 + longestMessageLength - 1;
const getSpaces = numSpaces => Array(numSpaces).join(' ');

console.log('\n');
console.log(chalk.bgRed(getSpaces(verticalPadding)));
messageDefs.forEach(messageDef => {
  let leftPadding = paddingLength;
  let rightPadding = paddingLength;
  const lengthDiff = longestMessageLength - messageDef.message.length;

  if (lengthDiff > 0) {
    const modifier = lengthDiff % 2 > 0 ? 1 : 0;
    const padding = paddingLength + Math.floor(lengthDiff / 2);

    leftPadding = padding;
    rightPadding = padding + modifier;
  }

  const formattedMessage = messageDef.chalkStyles.reduce(
    (accumulator, styleFn) => chalk[styleFn](accumulator),
    messageDef.message
  );

  console.log(chalk.bgRed(`${getSpaces(leftPadding)}${formattedMessage}${getSpaces(rightPadding)}`));
});
console.log(chalk.bgRed(getSpaces(verticalPadding)));
console.log('\n');
