import type {infer as zodInfer} from 'zod';
import {array, boolean, number, strictObject, string} from 'zod';

export const clientSettingsSchema = strictObject({
  dht: boolean(),
  dhtPort: number(),
  directoryDefault: string(),
  networkHttpMaxOpen: number(),
  networkLocalAddress: array(string()),
  networkMaxOpenFiles: number(),
  networkPortOpen: boolean(),
  networkPortRandom: boolean(),
  networkPortRange: string(),
  piecesHashOnCompletion: boolean(),
  piecesMemoryMax: number(),
  protocolPex: boolean(),
  throttleGlobalDownSpeed: number(),
  throttleGlobalUpSpeed: number(),
  throttleMaxPeersNormal: number(),
  throttleMaxPeersSeed: number(),
  throttleMaxDownloads: number(),
  throttleMaxDownloadsGlobal: number(),
  throttleMaxUploads: number(),
  throttleMaxUploadsGlobal: number(),
  throttleMinPeersNormal: number(),
  throttleMinPeersSeed: number(),
  trackersNumWant: number(),
});

export type ClientSettingsSchema = zodInfer<typeof clientSettingsSchema>;
