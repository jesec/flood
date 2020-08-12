import EN from './strings';

import CS from './translations/cs';
import DE from './translations/de';
import ES from './translations/es';
import FR from './translations/fr';
import IT from './translations/it';
import NL from './translations/nl';
import NO from './translations/no';
import PL from './translations/pl';
import PT from './translations/pt';
import RU from './translations/ru';
import RO from './translations/ro';
import SV from './translations/sv';
import UK from './translations/uk';
import KO from './translations/ko';
import JA from './translations/ja';
import ZH_HANS from './translations/zh-Hans';
import ZH_HANT from './translations/zh-Hant';
import AR from './translations/ar';

export const languages = {
  auto: EN,
  en: EN,
  cs: {
    ...EN,
    ...CS,
  },
  de: {
    ...EN,
    ...DE,
  },
  es: {
    ...EN,
    ...ES,
  },
  fr: {
    ...EN,
    ...FR,
  },
  it: {
    ...EN,
    ...IT,
  },
  nl: {
    ...EN,
    ...NL,
  },
  no: {
    ...EN,
    ...NO,
  },
  pl: {
    ...EN,
    ...PL,
  },
  pt: {
    ...EN,
    ...PT,
  },
  ru: {
    ...EN,
    ...RU,
  },
  ro: {
    ...EN,
    ...RO,
  },
  sv: {
    ...EN,
    ...SV,
  },
  uk: {
    ...EN,
    ...UK,
  },
  ko: {
    ...EN,
    ...KO,
  },
  ja: {
    ...EN,
    ...JA,
  },
  'zh-Hans': {
    ...EN,
    ...ZH_HANT,
    ...ZH_HANS,
  },
  'zh-Hant': {
    ...EN,
    ...ZH_HANS,
    ...ZH_HANT,
  },
  ar: {
    ...EN,
    ...AR,
  },
};
