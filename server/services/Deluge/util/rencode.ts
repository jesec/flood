// SPDX-License-Identifier: ISC
// Copyright (C) 2019, Cameron Tacklind
// Originally found on https://github.com/cinderblock/python-rencode/blob/master/src/rencode.ts

// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021, Contributors to the Flood project
// Imported and modified for the Flood project

// The intent is to match https://github.com/aresch/rencode

// Maximum length of integer when written as base 10 string.
const MAX_INT_LENGTH = 64;

// Positive integers with value embedded in typecode.
const INT_POS_FIXED_START = 0;
const INT_POS_FIXED_COUNT = 44;

// [49,57] is used to test if type is a string.

// The bencode 'typecodes' such as i, d, etc have been extended and
// relocated on the base-256 character set.
const CHR_LIST = 59;
const CHR_DICT = 60;
const CHR_INT = 61;
const CHR_INT1 = 62;
const CHR_INT2 = 63;
const CHR_INT4 = 64;
const CHR_INT8 = 65;
const CHR_FLOAT32 = 66;
const CHR_FLOAT64 = 44;
const CHR_TRUE = 67;
const CHR_FALSE = 68;
const CHR_NONE = 69;
// Negative integers with value embedded in typecode.
const INT_NEG_FIXED_START = 70;
const INT_NEG_FIXED_COUNT = 32;
// Dictionaries with length embedded in typecode.
const DICT_FIXED_START = 102;
const DICT_FIXED_COUNT = 25;
const CHR_TERM = 127;
// Strings with length embedded in typecode.
const STR_FIXED_START = 128;
const STR_FIXED_COUNT = 64;
const LIST_FIXED_START = STR_FIXED_START + STR_FIXED_COUNT;
// Lists with length embedded in typecode.
const LIST_FIXED_COUNT = 64;

class Buff {
  buff: Buffer;
  length: number;
  pos: number;

  constructor(buff?: Buffer) {
    this.buff = buff || Buffer.allocUnsafe(0);
    this.length = this.buff.length;
    this.pos = 0;
    this.appendChar = this.appendChar.bind(this);
    this.appendBuff = this.appendBuff.bind(this);
    this.slice = this.slice.bind(this);
  }

  static nextLength(needed: number): number {
    return Math.round(needed * 6);
  }

  appendChar(c: number) {
    const pos = this.length;
    this.length++;
    if (this.length > this.buff.length) {
      const old = this.buff;
      this.buff = Buffer.allocUnsafe(Buff.nextLength(this.length));
      old.copy(this.buff);
    }
    this.buff[pos] = c;
  }

  appendBuff(b: Buffer) {
    const pos = this.length;
    this.length += b.length;
    if (this.length > this.buff.length) {
      const old = this.buff;
      this.buff = Buffer.allocUnsafe(Buff.nextLength(this.length));
      old.copy(this.buff);
    }
    b.copy(this.buff, pos, 0, b.length);
  }

  slice() {
    return this.buff.slice(0, this.length);
  }
}

function writeBufferChar(buffs: Buff, c: number) {
  buffs.appendChar(c);
}

function writeBuffer(buffs: Buff, data: Buffer) {
  buffs.appendBuff(data);
}

function encodeChar(buffs: Buff, x: number) {
  if (0 <= x && x < INT_POS_FIXED_COUNT) writeBufferChar(buffs, INT_POS_FIXED_START + x);
  else if (-INT_NEG_FIXED_COUNT <= x && x < 0) writeBufferChar(buffs, INT_NEG_FIXED_START - 1 - x);
  else {
    writeBufferChar(buffs, CHR_INT1);
    writeBufferChar(buffs, x);
  }
}

function encodeShort(buffs: Buff, x: number) {
  writeBufferChar(buffs, CHR_INT2);
  const buff = Buffer.allocUnsafe(2);
  buff.writeIntBE(x, 0, 2);
  writeBuffer(buffs, buff);
}

function encodeInt(buffs: Buff, x: number) {
  writeBufferChar(buffs, CHR_INT4);
  const buff = Buffer.allocUnsafe(4);
  buff.writeIntBE(x, 0, 4);
  writeBuffer(buffs, buff);
}

function encodeLongLong(buffs: Buff, x: number) {
  writeBufferChar(buffs, CHR_INT8);
  const buff = Buffer.allocUnsafe(8);
  buff[0] = buff[1] = 0;
  // writeIntBE can't do more than 6 bytes in node :-/
  buff.writeIntBE(x, 2, 6);
  writeBuffer(buffs, buff);
}

function encodeBigNumber(buffs: Buff, x: number) {
  writeBufferChar(buffs, CHR_INT);
  // TODO: Make sure this matches python
  writeBuffer(buffs, Buffer.from('' + x));
  writeBufferChar(buffs, CHR_TERM);
}

function encodeFloat32(buffs: Buff, x: number) {
  writeBufferChar(buffs, CHR_FLOAT32);
  const buff = Buffer.allocUnsafe(4);
  buff.writeFloatBE(x, 0);
  writeBuffer(buffs, buff);
}

function encodeFloat64(buffs: Buff, x: number) {
  writeBufferChar(buffs, CHR_FLOAT64);
  const buff = Buffer.allocUnsafe(8);
  buff.writeDoubleBE(x, 0);
  writeBuffer(buffs, buff);
}

function encodeStr(buffs: Buff, str: string) {
  // JS strings are always utf8
  const buff = Buffer.from(str, 'utf8');

  if (buff.length < STR_FIXED_COUNT) {
    writeBufferChar(buffs, STR_FIXED_START + buff.length);
    writeBuffer(buffs, buff);
  } else {
    writeBuffer(buffs, Buffer.from(buff.length + ':', 'ascii'));
    writeBuffer(buffs, buff);
  }
}

function encodeNone(buffs: Buff) {
  writeBufferChar(buffs, CHR_NONE);
}

function encodeBool(buffs: Buff, x: boolean) {
  writeBufferChar(buffs, x ? CHR_TRUE : CHR_FALSE);
}

function encodeList(buffs: Buff, x: RencodableData[], floatBits: FloatBits) {
  if (x.length < LIST_FIXED_COUNT) {
    writeBufferChar(buffs, LIST_FIXED_START + x.length);
    x.forEach((i) => encode(buffs, i, floatBits));
  } else {
    writeBufferChar(buffs, CHR_LIST);
    x.forEach((i) => encode(buffs, i, floatBits));
    writeBufferChar(buffs, CHR_TERM);
  }
}

function encodeDictionary(buffs: Buff, x: RencodableObject, floatBits: FloatBits) {
  const keys = Object.keys(x);
  if (keys.length < DICT_FIXED_COUNT) {
    writeBufferChar(buffs, DICT_FIXED_START + keys.length);
    keys.forEach((k) => {
      encode(buffs, k, floatBits);
      encode(buffs, x[k], floatBits);
    });
  } else {
    writeBufferChar(buffs, CHR_DICT);
    keys.forEach((k) => {
      encode(buffs, k, floatBits);
      encode(buffs, x[k], floatBits);
    });
    writeBufferChar(buffs, CHR_TERM);
  }
}

const NUMBER_SIZE_MAX = [
  2 ** (8 * 1 - 1), // 128
  2 ** (8 * 2 - 1), // 32768
  2 ** (8 * 4 - 1), // MAX_SIGNED_INT
  // Node Buffer write functions only go to 6 bytes
  2 ** (8 * 6 - 1), // MAX_SIGNED_LONG_LONG
];

function canNumberFitInSize(x: number, bytes: number) {
  if (x < 0) x = -x - 1;
  return x < NUMBER_SIZE_MAX[bytes];
}

function encodeNumber(buffs: Buff, x: number, floatBits: FloatBits) {
  if (!Number.isInteger(x)) return floatBits == 32 ? encodeFloat32(buffs, x) : encodeFloat64(buffs, x);

  if (canNumberFitInSize(x, 0)) return encodeChar(buffs, x);
  if (canNumberFitInSize(x, 1)) return encodeShort(buffs, x);
  if (canNumberFitInSize(x, 2)) return encodeInt(buffs, x);
  if (canNumberFitInSize(x, 3)) return encodeLongLong(buffs, x);

  return encodeBigNumber(buffs, x);
}

export type RencodableData = undefined | null | number | string | boolean | RencodableArray | RencodableObject;

export type RencodableArray = Array<RencodableData>;

export type RencodableObject = {[K in string | number]?: RencodableData};

function encode(buffs: Buff, data: RencodableData, floatBits: FloatBits) {
  // typeof null === 'object' :-?
  if (data == null) return encodeNone(buffs);

  // typeof [] === 'object' :-/
  if (Array.isArray(data)) return encodeList(buffs, data, floatBits);

  if (typeof data == 'number') return encodeNumber(buffs, data, floatBits);
  if (typeof data == 'string') return encodeStr(buffs, data);
  if (typeof data == 'boolean') return encodeBool(buffs, data);
  if (typeof data == 'object') return encodeDictionary(buffs, data, floatBits);

  throw Error(`Cannot encode ${typeof data}`);
}

type FloatBits = 32 | 64;

function dumps(data: RencodableData, floatBits: FloatBits = 64) {
  const ret = new Buff();
  encode(ret, data, floatBits);
  return ret.slice();
}

function decodeChar(data: Buff): number {
  data.pos++;
  checkPos(data, data.pos);
  return data.buff.readIntBE(data.pos++, 1);
}

function decodeShort(data: Buff): number {
  checkPos(data, data.pos + 2);
  const ret = data.buff.readIntBE(data.pos + 1, 2);
  data.pos += 3;
  return ret;
}

function decodeInt(data: Buff): number {
  checkPos(data, data.pos + 4);
  const ret = data.buff.readIntBE(data.pos + 1, 4);
  data.pos += 5;
  return ret;
}

function decodeLongLong(data: Buff): number {
  checkPos(data, data.pos + 8);
  if (data.buff.readIntBE(data.pos + 1, 2) !== 0) throw Error('Encoded value outside of decodable range.');
  const ret = data.buff.readIntBE(data.pos + 3, 6);
  data.pos += 9;
  return ret;
}

function decodeFixedPosInt(data: Buff): number {
  data.pos += 1;
  return data.buff[data.pos - 1] - INT_POS_FIXED_START;
}

function decodeFixedNegInt(data: Buff): number {
  data.pos += 1;
  return (data.buff[data.pos - 1] - INT_NEG_FIXED_START + 1) * -1;
}

function decodeBigNumber(data: Buff): number {
  data.pos += 1;
  let x = 1;
  checkPos(data, data.pos + x);
  while (data.buff[data.pos + x] != CHR_TERM) {
    x += 1;
    if (x >= MAX_INT_LENGTH) {
      throw Error('Number is longer than ' + MAX_INT_LENGTH + ' characters');
    }
    checkPos(data, data.pos + x);
  }

  const bigNumber = Number(data.buff.toString('ascii', data.pos, data.pos + x));
  data.pos += x + 1;
  return bigNumber;
}

function decodeFloat32(data: Buff): number {
  checkPos(data, data.pos + 4);
  const ret = data.buff.readFloatBE(data.pos + 1);
  data.pos += 5;
  return ret;
}

function decodeFloat64(data: Buff): number {
  checkPos(data, data.pos + 8);
  const ret = data.buff.readDoubleBE(data.pos + 1);
  data.pos += 9;
  return ret;
}

function decodeFixedStr(data: Buff, decodeUTF8: boolean): string {
  const size = data.buff[data.pos] - STR_FIXED_START + 1;
  checkPos(data, data.pos + size - 1);
  const s = data.buff.toString(decodeUTF8 ? 'utf8' : 'ascii', data.pos + 1, data.pos + size);
  data.pos += size;
  return s;
}

function decodeStr(data: Buff, decodeUTF8: boolean): string {
  let x = 1;
  checkPos(data, data.pos + x);
  // 58 is ascii ':'
  while (data.buff[data.pos + x] != 58) {
    x += 1;
    checkPos(data, data.pos + x);
  }

  const size = Number(data.buff.toString('ascii', data.pos, data.pos + x));
  data.pos += x + 1;
  checkPos(data, data.pos + size - 1);
  const s = data.buff.toString(decodeUTF8 ? 'utf8' : 'ascii', data.pos, data.pos + size);
  data.pos += size;
  return s;
}

function decodeFixedList(data: Buff, decodeUTF8: boolean): RencodableArray {
  const l = [];
  let size = data.buff[data.pos] - LIST_FIXED_START;
  data.pos += 1;
  while (size--) l.push(decode(data, decodeUTF8));
  return l;
}

function decodeList(data: Buff, decodeUTF8: boolean): RencodableArray {
  const l = [];
  data.pos += 1;
  while (data.buff[data.pos] != CHR_TERM) l.push(decode(data, decodeUTF8));
  data.pos += 1;
  return l;
}

function decodeKeyValuePair(d: RencodableObject, data: Buff, decodeUTF8: boolean): void {
  const key = decode(data, decodeUTF8);
  const value = decode(data, decodeUTF8);
  if (!(typeof key == 'string' || typeof key == 'number'))
    throw TypeError('Received invalid value for dictionary key: ' + key);
  d[key] = value;
}

function decodeFixedDictionary(data: Buff, decodeUTF8: boolean): RencodableObject {
  const d = {};
  let size = data.buff[data.pos] - DICT_FIXED_START;
  data.pos += 1;
  while (size--) decodeKeyValuePair(d, data, decodeUTF8);
  return d;
}

function decodeDictionary(data: Buff, decodeUTF8: boolean): RencodableObject {
  const d = {};
  data.pos += 1;
  checkPos(data, data.pos);
  while (data.buff[data.pos] != CHR_TERM) decodeKeyValuePair(d, data, decodeUTF8);
  data.pos += 1;
  return d;
}

function checkPos(data: Buff, pos: number): void {
  if (pos >= data.length) throw Error('Tried to access data[' + pos + '] but data len is: ' + data.length);
}

function decode(data: Buff, decodeUTF8: boolean): RencodableData {
  if (data.pos >= data.length)
    throw Error('Malformed rencoded string: data.length: ' + data.length + ' pos: ' + data.pos);

  const typecode = data.buff[data.pos];

  if (typecode == CHR_INT1) return decodeChar(data);
  if (typecode == CHR_INT2) return decodeShort(data);
  if (typecode == CHR_INT4) return decodeInt(data);
  if (typecode == CHR_INT8) return decodeLongLong(data);
  if (typecode == CHR_INT) return decodeBigNumber(data);
  if (typecode == CHR_FLOAT32) return decodeFloat32(data);
  if (typecode == CHR_FLOAT64) return decodeFloat64(data);

  if (INT_POS_FIXED_START <= typecode && typecode < INT_POS_FIXED_START + INT_POS_FIXED_COUNT)
    return decodeFixedPosInt(data);

  if (INT_NEG_FIXED_START <= typecode && typecode < INT_NEG_FIXED_START + INT_NEG_FIXED_COUNT)
    return decodeFixedNegInt(data);

  if (STR_FIXED_START <= typecode && typecode < STR_FIXED_START + STR_FIXED_COUNT)
    return decodeFixedStr(data, decodeUTF8);

  // [49-57] == characters 1-9
  if (49 <= typecode && typecode <= 57) return decodeStr(data, decodeUTF8);

  if (typecode == CHR_NONE) {
    data.pos += 1;
    return null;
  }

  if (typecode == CHR_TRUE) {
    data.pos += 1;
    return true;
  }

  if (typecode == CHR_FALSE) {
    data.pos += 1;
    return false;
  }

  if (LIST_FIXED_START <= typecode && typecode < LIST_FIXED_START + LIST_FIXED_COUNT)
    return decodeFixedList(data, decodeUTF8);

  if (typecode == CHR_LIST) return decodeList(data, decodeUTF8);

  if (DICT_FIXED_START <= typecode && typecode < DICT_FIXED_START + DICT_FIXED_COUNT)
    return decodeFixedDictionary(data, decodeUTF8);

  if (typecode == CHR_DICT) return decodeDictionary(data, decodeUTF8);

  throw Error('Unexpected typecode received (' + typecode + ') at position ' + data.pos);
}

function loads(data: Buffer, decodeUTF8 = true): RencodableData {
  return decode(new Buff(data), decodeUTF8);
}

export {loads as decode, dumps, dumps as encode, loads};
