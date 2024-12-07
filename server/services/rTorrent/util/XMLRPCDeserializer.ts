// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Parser} from 'saxen';

import {RPCError} from '../types/RPCError';

type Value = Array<Value> | {[key: string]: Value} | number | string | boolean;

let stackMarks: Array<Value>;
let dataStack: Array<Value>;
let tmpData: Array<Value>;
let dataIsVal: boolean;
let endOfResponse;
let rejectCallback: (reason: Error) => void;

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

const onError = (err: Error) => {
  rejectCallback(err);
};

const closeTag = (elementName: string) => {
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
    case 'int':
    case 'string':
    case 'name':
      dataStack.push(tagValue);
      break;

    case 'methodResponse':
      endOfResponse = true;
      break;

    case 'array':
      stackMark = stackMarks.pop() as number;
      dataStack.splice(stackMark, dataStack.length - stackMark, dataStack.slice(stackMark));
      dataIsVal = false;
      break;

    case 'struct': {
      stackMark = stackMarks.pop() as number;
      const struct: Record<string, Value> = {};
      const items = dataStack.slice(stackMark);
      for (let i = 0; i < items.length; i += 2) {
        struct[items[i] as string] = items[i + 1];
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

const deserialize = (data: string) =>
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
      if (Array.isArray(dataStack[0])) {
        dataStack[0].forEach((response) => {
          const faultObject = (response as {faultString: string; faultCode: number}) || {};
          if (faultObject.faultCode) {
            return reject(RPCError(faultObject.faultString, faultObject.faultCode));
          }
        });
      } else {
        const faultObject = (dataStack[0] as {faultString: string; faultCode: number}) || {};
        if (faultObject.faultCode) {
          return reject(RPCError(faultObject.faultString, faultObject.faultCode));
        }
      }

      return resolve(dataStack[0]);
    }

    return reject(new Error('truncated response was received'));
  });

export default {deserialize};
