const saxen = require('saxen');

let stackMarks;
let dataStack;
let tmpData;
let dataIsVal;
let endOfResponse;
let rejectCallback;

const openTag = elementName => {
  if (elementName === 'array' || elementName === 'struct') {
    stackMarks.push(dataStack.length);
  }
  tmpData = [];
  dataIsVal = elementName === 'value';
};

const onText = value => {
  tmpData.push(value);
};

const onError = err => {
  rejectCallback(err);
};

const closeTag = elementName => {
  let stackMark;
  const tagValue = tmpData.join('');
  // types that rTorrent uses:
  // array, boolean, data, i4, i8, param, params, string, value, name, member, struct
  switch (elementName) {
    case 'boolean':
      dataStack.push(tagValue === '1');
      break;

    case 'value':
      if (dataIsVal) {
        dataStack.push(tagValue);
      }
      break;
    case 'i4':
    case 'i8':
    case 'string':
    case 'name':
      dataStack.push(tagValue);
      break;

    case 'methodResponse':
      endOfResponse = true;
      break;

    case 'array':
      stackMark = stackMarks.pop();
      dataStack.splice(stackMark, dataStack.length - stackMark, dataStack.slice(stackMark));
      dataIsVal = false;
      break;

    case 'struct': {
      stackMark = stackMarks.pop();
      const struct = {};
      const items = dataStack.slice(stackMark);
      for (let i = 0; i < items.length; i += 2) {
        struct[items[i]] = items[i + 1];
      }
      dataStack.splice(stackMark, dataStack.length - stackMark, struct);
      dataIsVal = false;
      break;
    }

    // unused - we ignore
    case 'data':
    case 'params':
    case 'param':
    case 'member':
      break;

    default:
      rejectCallback(`Unexpected XML-RPC Tag: ${elementName}`);
  }
};

const deserialize = (data, resolve, reject) => {
  stackMarks = [];
  dataStack = [];
  tmpData = [];
  dataIsVal = false;
  endOfResponse = false;
  rejectCallback = reject;
  const parser = new saxen.Parser();
  parser.on('openTag', openTag);
  parser.on('closeTag', closeTag);
  parser.on('text', onText);
  parser.on('error', onError);
  parser.parse(data);
  if (endOfResponse) {
    return resolve(dataStack[0]);
  }
  return reject('truncated response was received');
};

module.exports = {deserialize};
