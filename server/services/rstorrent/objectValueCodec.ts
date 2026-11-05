import type {ObjectValue} from './proto/rstorrent';

export type RPCObjectValue =
  string | number | bigint | boolean | null | RPCObjectValue[] | {[key: string]: RPCObjectValue};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value != null && !Array.isArray(value) && !Buffer.isBuffer(value);

/**
 * JS -> ObjectValue, used for CommandService arguments.
 *
 * Flood's rTorrent DSL calls are string-based; the remaining types are here so
 * that `system.multicall` structures ({methodName, params}) and raw torrent
 * bytes (Buffer) round-trip correctly.
 */
export const toObjectValue = (value: unknown): ObjectValue => {
  if (value == null) {
    return {nullValue: true};
  }

  if (typeof value === 'boolean') {
    return {boolValue: value};
  }

  if (typeof value === 'bigint') {
    return {intValue: value};
  }

  if (typeof value === 'number') {
    if (Number.isSafeInteger(value)) {
      return {intValue: BigInt(value)};
    }

    // ObjectValue has no floating point type; the rTorrent DSL treats
    // parameters as strings anyway.
    return {stringValue: String(value)};
  }

  if (typeof value === 'string') {
    return {stringValue: value};
  }

  if (Buffer.isBuffer(value)) {
    return {bytesValue: value};
  }

  if (value instanceof Uint8Array) {
    return {bytesValue: Buffer.from(value)};
  }

  if (Array.isArray(value)) {
    return {listValue: {values: value.map(toObjectValue)}};
  }

  if (isPlainObject(value)) {
    const fields: Record<string, ObjectValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      fields[key] = toObjectValue(entry);
    }
    return {mapValue: {fields}};
  }

  return {stringValue: String(value)};
};

const intToJS = (value: bigint): number | bigint => {
  if (value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER)) {
    return Number(value);
  }

  return value;
};

/**
 * ObjectValue -> JS in the shape the SCGI/XML-RPC transport used to produce,
 * so the existing methodCallConfig transformers keep working unchanged.
 */
export const fromObjectValue = (value: ObjectValue | undefined): unknown => {
  if (value == null) {
    return undefined;
  }

  if (value.nullValue != null) {
    // Legacy rTorrent methods return an empty string for void results.
    return '';
  }

  if (value.intValue != null) {
    return intToJS(value.intValue);
  }

  if (value.stringValue != null) {
    return value.stringValue;
  }

  if (value.bytesValue != null) {
    return value.bytesValue.toString('utf8');
  }

  if (value.boolValue != null) {
    return value.boolValue;
  }

  if (value.listValue != null) {
    return value.listValue.values.map(fromObjectValue);
  }

  if (value.mapValue != null) {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value.mapValue.fields)) {
      result[key] = fromObjectValue(entry);
    }
    return result;
  }

  return undefined;
};
