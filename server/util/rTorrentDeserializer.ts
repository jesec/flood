// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import {Parser} from 'saxen';

type Data = string | boolean | Array<string> | object;

let stackMarks: Array<number>;
let dataStack: Array<Data>;
let tmpData: Array<string>;
let dataIsVal: boolean;
let endOfResponse;
let rejectCallback: (err: string) => void;

let parserInit = false;
const parser = new Parser();

const unescapeXMLString = (value: string) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

const openTag = (elementName: string) => {
  if (elementName === 'array' || elementName === 'struct') {
    stackMarks.push(dataStack.length);
  }
  tmpData = [];
  dataIsVal = elementName === 'value';
};

const onText = (value: string) => {
  tmpData.push(unescapeXMLString(value));
};

const onError = (err: string) => {
  rejectCallback(err);
};

const closeTag = (elementName: string) => {
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
      if (stackMark != null) {
        dataStack.splice(stackMark, dataStack.length - stackMark, dataStack.slice(stackMark) as Array<string>);
      }
      dataIsVal = false;
      break;

    case 'struct': {
      stackMark = stackMarks.pop();
      const struct: Record<string, Data> = {};
      const items = dataStack.slice(stackMark);
      for (let i = 0; i < items.length; i += 2) {
        const key = items[i];
        if (typeof key === 'string') {
          struct[key] = items[i + 1];
        }
      }
      if (stackMark != null) {
        dataStack.splice(stackMark, dataStack.length - stackMark, struct);
      }
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

const deserialize = (data: string, resolve: (data: Data) => void, reject: (err: string) => void): void => {
  stackMarks = [];
  dataStack = [];
  tmpData = [];
  dataIsVal = false;
  endOfResponse = false;
  rejectCallback = reject;

  initParser();
  parser.parse(data);

  if (endOfResponse) {
    return resolve(dataStack[0]);
  }

  return reject('truncated response was received');
};

export default {deserialize};
