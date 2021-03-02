import {Parser} from 'saxen';

let stackMarks;
let dataStack;
let tmpData;
let dataIsVal;
let endOfResponse;
let rejectCallback;

let parserInit = false;
const parser = new Parser();

const XMLRPCFaultError = (message, isFault) => {
  const e = new Error(message);
  e.isFault = isFault;
  return e;
};

const unescapeXMLString = (value) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

const openTag = (elementName) => {
  if (elementName === 'array' || elementName === 'struct') {
    stackMarks.push(dataStack.length);
  }
  tmpData = [];
  dataIsVal = elementName === 'value';
};

const onText = (value) => {
  tmpData.push(unescapeXMLString(value));
};

const onError = (err) => {
  rejectCallback(err);
};

const closeTag = (elementName) => {
  let stackMark;
  const tagValue = tmpData.join('');
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
    case 'fault':
    case 'params':
    case 'param':
    case 'member':
      break;

    default:
      rejectCallback(new Error(`Unexpected XML-RPC Tag: ${elementName}`));
  }
};

const initParser = () => {
  if (parserInit === true) {
    return;
  }

  parser.on('openTag', openTag);
  parser.on('closeTag', closeTag);
  parser.on('text', onText);
  parser.on('error', onError);

  parserInit = true;
};

const deserialize = (data) =>
  new Promise((resolve, reject) => {
    stackMarks = [];
    dataStack = [];
    tmpData = [];
    dataIsVal = false;
    endOfResponse = false;
    rejectCallback = reject;

    initParser();
    parser.parse(data);

    if (endOfResponse) {
      if (dataStack[0]?.faultString) {
        return reject(XMLRPCFaultError(dataStack[0].faultString, true));
      }

      if (dataStack[0]?.[0]?.faultString) {
        return reject(XMLRPCFaultError(dataStack[0][0].faultString, true));
      }

      return resolve(dataStack[0]);
    }

    return reject(new Error('truncated response was received'));
  });

export default {deserialize};
