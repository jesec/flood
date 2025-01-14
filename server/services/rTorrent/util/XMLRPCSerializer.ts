// SPDX-License-Identifier: MIT
// Copyright (C) 2021, Jesús Leganés-Combarro
// Originally found on https://github.com/piranna/XmlRPC-serialization/blob/main/lib/stringify.js

// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021, Contributors to the Flood project
// Imported and modified for the Flood project

export type XMLRPCValue = Array<XMLRPCValue> | {[key: string]: XMLRPCValue} | number | string | boolean | Date | Buffer;

const value = (value: XMLRPCValue): string => {
  if (value == null) return '';

  let type: string;

  if (Array.isArray(value)) {
    type = 'array';
    value = data(value);
  } else if (Number.isInteger(value)) {
    type = 'i4';
  } else if (typeof value === 'number') {
    type = 'double';
  } else if (typeof value === 'string') {
    type = 'string';
    value = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  } else if (typeof value === 'boolean') {
    type = 'boolean';
    value = value ? '1' : '0';
  } else if (value instanceof Date) {
    type = 'dateTime.iso8601';
    value = value.toISOString();
  } else if (value instanceof Buffer) {
    type = 'base64';
    value = value.toString('base64');
  } else {
    type = 'struct';
    value = members(value);
  }

  return `<value><${type}>${value}</${type}></value>`;
};

const data = (values: XMLRPCValue[]) => {
  return `<data>${values.map(value).join('')}</data>`;
};

const member = ([key, val]: [string, XMLRPCValue]) => {
  return `<member><name>${key}</name>${value(val)}</member>`;
};

const members = (value: {[key: string]: XMLRPCValue}) => {
  return Object.entries(value).map(member).join('');
};

const param = (param: XMLRPCValue) => {
  return `<param>${value(param)}</param>`;
};

const sParams = (params: XMLRPCValue[]) => {
  if (!params?.length) return '';

  return `<params>${params.map(param).join('')}</params>`;
};

const serializeSync = (methodName: string, params: XMLRPCValue[]): string => {
  return `<?xml version="1.0"?><methodCall><methodName>${methodName}</methodName>${sParams(params)}</methodCall>`;
};

const serialize = async (methodName: string, params: XMLRPCValue[]): Promise<string> =>
  serializeSync(methodName, params);

export default {serialize, serializeSync};
