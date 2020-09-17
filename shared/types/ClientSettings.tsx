// TODO: Unite with clientSettingsMap when server is TS.

import {clientSettings} from '../constants/clientSettingsMap';

export type ClientSetting = keyof typeof clientSettings;
export type ClientSettings = {
  // TODO: Need proper types for each property
  [property in ClientSetting]?: string | Record<string, unknown> | null;
};
