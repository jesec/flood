import type {infer as zodInfer} from 'zod';
import {array, boolean, strictObject, string, z} from 'zod';

const coerceNumber = z.coerce.number();

export const clientSettingsSchema = strictObject({
  dht: boolean(),
  dhtPort: coerceNumber,
  directoryDefault: string(),
  networkHttpMaxOpen: coerceNumber,
  networkLocalAddress: array(string()),
  networkMaxOpenFiles: coerceNumber,
  networkPortOpen: boolean(),
  networkPortRandom: boolean(),
  networkPortRange: string(),
  piecesHashOnCompletion: boolean(),
  piecesMemoryMax: coerceNumber,
  protocolPex: boolean(),
  throttleGlobalDownSpeed: coerceNumber,
  throttleGlobalUpSpeed: coerceNumber,
  throttleMaxPeersNormal: coerceNumber,
  throttleMaxPeersSeed: coerceNumber,
  throttleMaxDownloads: coerceNumber,
  throttleMaxDownloadsGlobal: coerceNumber,
  throttleMaxUploads: coerceNumber,
  throttleMaxUploadsGlobal: coerceNumber,
  throttleMinPeersNormal: coerceNumber,
  throttleMinPeersSeed: coerceNumber,
  trackersNumWant: coerceNumber,
}).strip();

// PATCH /api/client/settings
export const setClientSettingsSchema = clientSettingsSchema.partial().strip();

export type ClientSettingsSchema = zodInfer<typeof clientSettingsSchema>;
export type SetClientSettingsSchema = zodInfer<typeof setClientSettingsSchema>;
