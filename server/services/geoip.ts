import {Reader} from '@maxmind/geoip2-node';

import * as data from '../geoip/data';

const r = Reader.openBuffer(data.data);

export function lookup(s: string): string {
  try {
    return r.country(s)?.country?.isoCode ?? '';
  } catch {
    return '';
  }
}
